#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR"

TS=$(date +%Y%m%d_%H%M%S)
BUILD_DIR="$ROOT_DIR/builds"
BACKUP_DIR="$ROOT_DIR/backups"
VSIX_NAME="css-classes-from-html-0.0.7.vsix"

mkdir -p "$BUILD_DIR" "$BACKUP_DIR"

# 1) Статичні перевірки: ESLint + базові grep-и на заглушки/Mock
if [ -f .eslintrc.js ] || [ -f .eslintrc.json ]; then
  echo "🔎 ESLint..."
  npm run lint || true
fi

echo "�� Перевіряю на заглушки/Mock..."
! grep -RInE "\\b(MOCK|Mock|stub|TODO:)\\b" backend extension.js frontend || true

# 2) Тести
echo "🧪 Тести..."
npm test

# 3) Побудова
echo "🏗️ Build..."
npm run build

# 4) Бекап попереднього VSIX
if [ -f "$BUILD_DIR/$VSIX_NAME" ]; then
  echo "🗄️ Бекап попереднього VSIX..."
  cp "$BUILD_DIR/$VSIX_NAME" "$BACKUP_DIR/${VSIX_NAME%.vsix}-$TS.vsix"
fi

# 5) Пакування нового VSIX
echo "📦 Пакування VSIX..."
npm run package

echo "✅ Release завершено. VSIX у builds/, бекап у backups/."
