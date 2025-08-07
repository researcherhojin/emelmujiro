module.exports = {
  // Frontend linting
  'frontend/src/**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  'frontend/src/**/*.{css,scss}': ['prettier --write'],

  // Backend linting
  'backend/**/*.py': ['black', 'flake8 --max-line-length=120 --exclude=migrations'],

  // General files
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
