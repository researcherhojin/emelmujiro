const path = require('path');

module.exports = {
  // Frontend linting
  'frontend/src/**/*.{js,jsx,ts,tsx}': (filenames) => {
    // Convert absolute paths to paths relative to frontend/
    const relFiles = filenames
      .map((f) => path.relative(path.join(__dirname, 'frontend'), f))
      .join(' ');
    return [
      `cd frontend && npx eslint --fix ${relFiles}`,
      `prettier --write ${filenames.join(' ')}`,
    ];
  },
  'frontend/src/**/*.{css,scss}': ['prettier --write'],

  // Backend linting (paths are relative to repo root, run from backend dir)
  'backend/**/*.py': (filenames) => {
    // Convert absolute paths to paths relative to backend/
    const relFiles = filenames
      .map((f) => path.relative(path.join(__dirname, 'backend'), f))
      .join(' ');
    return [
      `cd backend && uv run black --check ${relFiles}`,
      `cd backend && uv run flake8 --max-line-length=120 ${relFiles}`,
    ];
  },

  // General files
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
