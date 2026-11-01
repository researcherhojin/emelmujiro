You are investigating a failed scheduled security scan for this repository, unattended. Nobody will answer questions. The failed checks are: {{FAILED}}.

Inputs, copied from the private host report: `{{INPUT}}`. `operations.json` holds the booleans, the `*-scheduled.log` files give per-target counts, `dependencies/*.json` holds the npm audit and Trivy lockfile results, and the image scan JSON files are named after their services.

Tool rules. Only a fixed allowlist runs, and anything else is refused without a prompt:

- Read files with the Read, Grep and Glob tools, never with `cat`, `head`, `ls` or `cd`.
- Run each Bash command on its own from the repository root, with no `cd`, `&&`, `;` or pipe. The allowed command forms are:
  - `npm ci`, `npm install --package-lock-only`, `npm audit`, `npm ls`, `npm view`, `npm run`, `npm test`
  - `npx eslint`, `npx prettier`
  - `node scripts/security/...`
  - `git status`, `git diff`, `git log` (read-only: `.git` is not writable)
- Bash runs in a sandbox. The network reaches only the npm registry and the Trivy database mirror. You have no GitHub access and no credentials, and you do not need any.
- Use `--workspace=frontend` instead of changing directory.
- A refused command does not mean Bash is unavailable. Rewrite it in an allowed form and continue. Record in the diagnosis only the commands that no allowed form can replace.

Follow this procedure, which is how past alarms were fixed (`docs/intents/infra/security-operations.md` › Alarm history):

1. Read the inputs and list each finding: package, installed version, advisory ID, severity and fixed version, and the target that reported it.
2. Reproduce locally. Run `npm ci --legacy-peer-deps`, then `node scripts/security/scan-dependencies.ts`. Run the image scan only if you can read its JSON; never start Docker.
3. Fix each finding with the smallest change: a patch or minor bump in the lockfile, a raised floor in `overrides`, or a Dockerfile pin. Read `CLAUDE.md` Gotchas #3, #6, #8, #13 and #14 first. Never run `npm audit fix`. After any lockfile change, confirm `@rolldown/binding-linux-x64-gnu` is still listed in `package-lock.json`.
4. If a fix requires a major upgrade, check that every consumer of the package still works. If one breaks, do not force it.
5. **Never add or extend an ignore entry** (`trivyignore.yaml`, a dismissed alert, an expiry). Accepting a risk is the owner's decision. Write the case for or against it in the diagnosis instead.
6. Verify with `npm run lint --workspace=frontend`, `npm run type-check --workspace=frontend`, `npm test --workspace=frontend -- --run`, `npm run check:scripts` and `node scripts/security/scan-dependencies.ts`. Record each result.
7. If you changed files, leave them uncommitted in the working tree and write `{{PR}}`:
   - The first line is a conventional commit subject (`scripts/repo/check-commit-msg.sh`). It becomes the commit message and the PR title.
   - The rest is the body.
   - Include a `CHANGELOG.md` entry under `## Merged since [1.0.0]` among your changes.
   - The body may name packages, versions and advisory IDs. It must not contain host names, paths outside the repository, container or image IDs, or report contents beyond those findings.
   - The open alarm issue is {{ISSUE}}. Reference it when there is one.
   - After you finish, a separate step commits, pushes and opens the draft PR. It does that only if every changed file is one a dependency or image fix needs: manifests, lock files, Docker build files, `docker-compose.yml`, Umami patches and `CHANGELOG.md`. Remove any other file you created, such as a scratch script, or nothing is published.
8. Always write `{{DIAGNOSIS}}`, including when you open no PR. Cover each finding, its fix or why none is safe, every verification result, any command that was refused, and whether you wrote `{{PR}}`.

Stop after step 8. Do not touch anything outside this clone, `{{PR}}` and `{{DIAGNOSIS}}`.
