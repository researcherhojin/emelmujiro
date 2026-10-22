import fs from 'node:fs';
import { errorMessage, isMain, isRecord } from './security-runtime.ts';

export function validateScan(report: unknown, expectedType?: string): number {
  if (
    !isRecord(report) ||
    report.SchemaVersion !== 2 ||
    !Array.isArray(report.Results) ||
    !report.Results.length
  ) {
    throw new Error('Scanner returned no inventory');
  }
  let packages = 0;
  let findings = 0;
  let expectedFound = !expectedType;
  for (const target of report.Results as unknown[]) {
    if (
      !isRecord(target) ||
      !['os-pkgs', 'lang-pkgs'].includes(String(target.Class)) ||
      typeof target.Type !== 'string' ||
      typeof target.Target !== 'string' ||
      !Array.isArray(target.Packages) ||
      target.Packages.some(
        (pkg: unknown) =>
          !isRecord(pkg) ||
          typeof pkg.Name !== 'string' ||
          !pkg.Name ||
          typeof pkg.Version !== 'string'
      ) ||
      (target.Vulnerabilities !== undefined && !Array.isArray(target.Vulnerabilities))
    ) {
      throw new Error('Invalid scanner inventory');
    }
    packages += target.Packages.length;
    if (target.Type === expectedType && target.Packages.length) expectedFound = true;
    findings += Array.isArray(target.Vulnerabilities) ? target.Vulnerabilities.length : 0;
  }
  if (!packages || !expectedFound) throw new Error('Expected package inventory is missing');
  return findings;
}
if (isMain(import.meta.url)) {
  try {
    if (validateScan(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3])) {
      throw new Error('Vulnerabilities found');
    }
  } catch (error) {
    console.error(errorMessage(error));
    process.exitCode = 1;
  }
}
