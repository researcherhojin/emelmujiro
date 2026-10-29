// cspell:ignore ignorefile
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensurePrivateDir, writePrivate, writePrivateAtomic } from '../shared/private-fs.ts';
import type { Command } from '../shared/runtime.ts';
import { validateScan } from '../security/scan-report.ts';
import { validateReport } from '../security/report.ts';
import { verifyRuntime } from './health.ts';

export const REFRESH_SERVICES = ['umami-db', 'umami', 'backend'] as const;
type Service = (typeof REFRESH_SERVICES)[number];
type Images = Record<Service, string>;
const imagePattern = /^sha256:[a-f0-9]{64}$/;
export type RefreshResult = {
  version: 1;
  startedAt: string;
  completedAt: string;
  source: string;
  success: boolean;
  phase: string;
  recovery: 'not-needed' | 'passed' | 'failed';
  old: Partial<Images>;
  candidates: Partial<Images>;
  running: Partial<Images>;
};

export function refreshImages({
  root,
  directory,
  trivy,
  run,
}: {
  root: string;
  directory: string;
  trivy: string;
  run: Command;
}): RefreshResult {
  ensurePrivateDir(directory);
  const id = crypto.randomUUID();
  const work = path.join(directory, id);
  fs.mkdirSync(work, { mode: 0o700 });
  const result: RefreshResult = {
    version: 1,
    startedAt: new Date().toISOString(),
    completedAt: '',
    source: '',
    success: false,
    phase: 'preflight',
    recovery: 'not-needed',
    old: {},
    candidates: {},
    running: {},
  };
  const references = {} as Images;
  const candidateTags = {} as Images;
  const mutated: Service[] = [];
  const compose = [
    'compose',
    '--project-directory',
    root,
    '-f',
    path.join(root, 'docker-compose.yml'),
  ];
  const override = path.join(work, 'images.json');
  const inspect = (service: Service) => {
    const value = JSON.parse(
      run('docker', [
        'container',
        'inspect',
        '--format',
        '[{{json .Image}},{{json .Config.Image}},{{json .State.Running}}]',
        `emelmujiro-${service}`,
      ])
    );
    if (
      !Array.isArray(value) ||
      !imagePattern.test(value[0]) ||
      typeof value[1] !== 'string' ||
      value[2] !== true
    ) {
      throw new Error('Invalid running image identity');
    }
    run('docker', ['image', 'inspect', value[0]]);
    return { image: value[0] as string, reference: value[1] as string };
  };
  const health = (reload = false) =>
    verifyRuntime({ run, sha: result.source, reload, attempts: reload ? 12 : 1 });
  const replace = (service: Service) =>
    run('docker', [
      ...compose,
      '-f',
      override,
      'up',
      '-d',
      '--no-build',
      '--pull',
      'never',
      '--no-deps',
      '--wait',
      '--wait-timeout',
      '180',
      service,
    ]);
  try {
    if (run('git', ['-C', root, 'status', '--porcelain', '--untracked-files=no']).trim())
      throw new Error('Dirty tracked checkout');
    result.source = run('git', ['-C', root, 'rev-parse', 'HEAD']).trim();
    if (!/^[a-f0-9]{40}$/.test(result.source)) throw new Error('Invalid source SHA');
    health();
    for (const service of REFRESH_SERVICES) {
      const current = inspect(service);
      result.old[service] = current.image;
      references[service] = current.reference;
      candidateTags[service] = `emelmujiro/refresh-${service}:${id}`;
      run('docker', ['tag', current.image, `emelmujiro/rollback-${service}:${id}`]);
    }
    writePrivate(
      override,
      JSON.stringify({
        services: Object.fromEntries(
          REFRESH_SERVICES.map((service) => [service, { image: references[service] }])
        ),
      })
    );
    const source = path.join(work, 'source');
    fs.mkdirSync(source);
    const archive = path.join(work, 'source.tar');
    run('git', ['-C', root, 'archive', '--format=tar', '--output', archive, result.source]);
    run('tar', ['-xf', archive, '-C', source]);
    fs.unlinkSync(archive);
    result.phase = 'build';
    const contexts: Record<Service, string> = {
      'umami-db': 'docker/postgres',
      umami: 'docker/umami',
      backend: 'backend',
    };
    for (const service of REFRESH_SERVICES) {
      run('docker', [
        'build',
        '--pull',
        '--no-cache',
        '--provenance=false',
        '--sbom=false',
        '--build-arg',
        `GIT_COMMIT=${result.source}`,
        '-t',
        candidateTags[service],
        path.join(source, contexts[service]),
      ]);
      const image = run('docker', [
        'image',
        'inspect',
        '--format',
        '{{.Id}}',
        candidateTags[service],
      ]).trim();
      if (!imagePattern.test(image)) throw new Error('Candidate has no image identity');
      result.candidates[service] = image;
    }
    result.phase = 'verify';
    run('bash', [path.join(source, 'docker/postgres/verify.sh'), candidateTags['umami-db']]);
    run('env', [
      `UMAMI_TEST_IMAGE=${candidateTags.umami}`,
      `UMAMI_TEST_DB_IMAGE=${candidateTags['umami-db']}`,
      'bash',
      path.join(source, 'docker/umami/verify.sh'),
    ]);
    run('bash', [
      path.join(source, 'scripts/deploy/verify-backend-image.sh'),
      candidateTags.backend,
      result.source,
      result.old.backend!,
      result.source,
    ]);
    run(trivy, ['image', '--download-db-only', '--no-progress']);
    for (const service of REFRESH_SERVICES) {
      const raw = run(trivy, [
        'image',
        '--image-src',
        'docker',
        '--scanners',
        'vuln',
        '--skip-db-update',
        '--ignorefile',
        '/dev/null',
        '--ignore-unfixed=false',
        '--severity',
        'UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL',
        '--format',
        'json',
        '--list-all-pkgs=true',
        '--exit-code',
        '0',
        '--timeout',
        '10m',
        '--no-progress',
        result.candidates[service]!,
      ]);
      writePrivate(path.join(work, `${service}-scan.json`), raw);
      if (validateScan(JSON.parse(raw), 'alpine') !== 0)
        throw new Error('Candidate scan has findings');
    }
    result.phase = 'backup';
    run('python3', [path.join(root, 'scripts/backup/backup-verify.py')]);
    // Revalidate all preconditions at the mutation boundary, even while locked.
    if (
      run('git', ['-C', root, 'rev-parse', 'HEAD']).trim() !== result.source ||
      run('git', ['-C', root, 'status', '--porcelain', '--untracked-files=no']).trim()
    )
      throw new Error('Source changed');
    health();
    for (const service of REFRESH_SERVICES) {
      if (inspect(service).image !== result.old[service]) throw new Error('Running image changed');
    }
    result.phase = 'apply';
    for (const service of REFRESH_SERVICES) {
      // Record before mutation: a failing Compose command may have replaced a container.
      mutated.push(service);
      run('docker', ['tag', result.candidates[service]!, references[service]]);
      replace(service);
      if (inspect(service).image !== result.candidates[service])
        throw new Error('Replacement identity mismatch');
      if (service === 'umami') health(true);
    }
    health(true);
    result.phase = 'audit';
    run(process.execPath, [path.join(root, 'scripts/security/scan-running-images.ts')]);
    const summary = validateReport(
      JSON.parse(fs.readFileSync(path.join(directory, '..', 'summary.json'), 'utf8'))
    );
    if (summary.services.some((service) => service.status !== 'clean'))
      throw new Error('Running image audit failed');
    for (const service of REFRESH_SERVICES) {
      result.running[service] = inspect(service).image;
      if (result.running[service] !== result.candidates[service])
        throw new Error('Final running image mismatch');
    }
    result.phase = 'complete';
    result.success = true;
  } catch (error) {
    writePrivate(path.join(work, 'error.log'), String(error));
    if (mutated.length) {
      result.recovery = 'failed';
      try {
        // Restore all references first, then restore services in dependency order.
        for (const service of mutated)
          run('docker', ['tag', result.old[service]!, references[service]]);
        for (const service of REFRESH_SERVICES.filter((service) => mutated.includes(service)))
          replace(service);
        health(true);
        for (const service of REFRESH_SERVICES) {
          result.running[service] = inspect(service).image;
          if (result.running[service] !== result.old[service])
            throw new Error('Recovery identity mismatch');
        }
        result.recovery = 'passed';
      } catch (recovery) {
        writePrivate(path.join(work, 'recovery-error.log'), String(recovery));
      }
    }
  } finally {
    result.completedAt = new Date().toISOString();
    writePrivate(path.join(work, 'result.json'), JSON.stringify(result));
    writePrivateAtomic(
      path.join(directory, 'latest.json'),
      path.join(directory, `${id}.tmp`),
      JSON.stringify(result)
    );
    fs.rmSync(path.join(work, 'source'), { recursive: true, force: true });
    fs.rmSync(path.join(work, 'source.tar'), { force: true });
    // Keep two owned generations, including rollback tags, without broad image/cache pruning.
    const generations = fs
      .readdirSync(directory)
      .filter((name) => /^[a-f0-9-]{36}$/.test(name))
      .filter((name) => fs.lstatSync(path.join(directory, name)).isDirectory())
      .flatMap((name) => {
        try {
          const recorded = JSON.parse(
            fs.readFileSync(path.join(directory, name, 'result.json'), 'utf8')
          );
          const time = Date.parse(recorded.startedAt);
          return Number.isFinite(time) ? [{ name, time }] : [];
        } catch {
          return [];
        }
      })
      .sort((a, b) => b.time - a.time);
    for (const generation of generations.slice(2)) {
      for (const service of REFRESH_SERVICES) {
        for (const prefix of ['refresh', 'rollback']) {
          try {
            run('docker', ['image', 'rm', `emelmujiro/${prefix}-${service}:${generation.name}`]);
          } catch {
            /* A running container or another tag can keep an image alive. Never force removal. */
          }
        }
      }
      for (const service of REFRESH_SERVICES) {
        fs.rmSync(path.join(directory, generation.name, `${service}-scan.json`), { force: true });
      }
      // Retain compact reports and diagnostics; discard old inventories and source trees.
      fs.rmSync(path.join(directory, generation.name, 'source'), { recursive: true, force: true });
    }
  }
  return result;
}
