/// <reference types="node" />
// Typed by scripts/tsconfig.json in CI; the directive is for editors, which find no root tsconfig.
export default {
  // Frontend linting
  'frontend/src/**/*.{js,jsx,ts,tsx}': [
    'npm exec --workspace frontend -- eslint --fix --max-warnings=0',
    'prettier --write',
  ],
  'frontend/src/**/*.{css,scss}': ['prettier --write'],

  'backend/**/*.py': ['uv run --directory backend black', 'uv run --directory backend flake8'],

  // General files
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
