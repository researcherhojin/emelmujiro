#!/bin/bash

# Script to remove console statements and replace with logger

# Files to process
FILES=(
  "src/utils/performanceMonitoring.ts"
  "src/components/common/NotificationPrompt.tsx"
  "src/components/common/WebVitalsDashboard.tsx"
  "src/components/common/LanguageSwitcher.tsx"
  "src/hooks/usePerformance.ts"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."

  # Check if logger is already imported
  if ! grep -q "import logger" "$file"; then
    # Add logger import after the first import or at the beginning
    if grep -q "^import" "$file"; then
      # Add after first import
      sed -i '' "0,/^import.*$/s//&\nimport logger from '@\/utils\/logger';/" "$file"
    else
      # Add at the beginning
      sed -i '' "1s/^/import logger from '@\/utils\/logger';\n\n/" "$file"
    fi
  fi

  # Replace console statements with logger
  sed -i '' "s/console\.error(/logger.error(/g" "$file"
  sed -i '' "s/console\.warn(/logger.warn(/g" "$file"
  sed -i '' "s/console\.log(/logger.info(/g" "$file"
  sed -i '' "s/console\.debug(/logger.debug(/g" "$file"
  sed -i '' "s/console\.info(/logger.info(/g" "$file"
done

echo "✅ Console statements replaced with logger in all files"
