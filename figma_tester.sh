#!/bin/bash

# figma_tester.sh - інтерактивна перевірка Figma API
# Виконати: ./figma_tester.sh "<figma_url>" "<figma_token>"

set -o pipefail

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Логи тепер у ./logs/
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/figma_test_$(date +%Y%m%d_%H%M%S).log"

# Функція логування
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Маскування токена (показує перші 4 та останні 4 символи)
mask_token() {
    local t="$1"
    local len=${#t}
    if [ "$len" -le 8 ]; then
        echo "$t"
    else
        echo "${t:0:4}...${t: -4}"
    fi
}

# ❌ (рядок 42-62) старий код 🔴
# extract_file_id() {
#     local file_id=""
#     local patterns=(
#       'file/([a-zA-Z0-9]{17,22})(/|$)'
#       'design/([a-zA-Z0-9]{17,22})(/|$)'
#       'figma\.com/(?:file|design)/([a-zA-Z0-9]{17,22})'
#       '([a-zA-Z0-9]{17,22})'
#     )
#     for pat in "${patterns[@]}"; do
#         if [[ $url =~ $pat ]]; then
#             file_id="${BASH_REMATCH[1]}"
#             break
#         fi
#     done
#     echo "$file_id"
# }
# ✅ (рядок 42-62) FIX: передача $1 та sed для bash, без (?:) груп 🟢
extract_file_id() {
    local url="$1"
    local id=""

    id=$(echo "$url" | sed -nE 's#.*/(file|design)/([A-Za-z0-9]{17,22}).*#\2#p')
    if [ -n "$id" ]; then
        echo "$id"
        return 0
    fi

    id=$(echo "$url" | sed -nE 's#.*figma\.com/(file|design)/?([A-Za-z0-9]{17,22}).*#\2#p')
    if [ -n "$id" ]; then
        echo "$id"
        return 0
    fi

    id=$(echo "$url" | grep -oE '[A-Za-z0-9]{17,22}' | head -n1)
    echo "$id"
}

check_deps() {
    local missing=()
    command -v curl >/dev/null 2>&1 || missing+=("curl")
    command -v jq >/dev/null 2>&1 || missing+=("jq")
    if [ ${#missing[@]} -ne 0 ]; then
        echo "Встановіть: ${missing[*]}"
        exit 1
    fi
}

usage() {
    echo "Використання: $0 <figma_url> <figma_token>"
    echo "Або запустіть без аргументів для інтерактивного вводу."
}

URL_ARG="$1"
TOKEN_ARG="$2"

if [ -z "$URL_ARG" ]; then
    read -p "Введіть Figma URL: " URL_ARG
fi
if [ -z "$TOKEN_ARG" ]; then
    read -s -p "Введіть Figma Token: " TOKEN_ARG
    echo
fi

FIGMA_TOKEN="$TOKEN_ARG"

# ❌ (рядок 99-103) старий код 🔴
# echo "✅ File ID: ABC123def456GHI789jkl"
# file_id="ABC123def456GHI789jkl"
# echo "ℹ️  Тестування Figma API..."
# ✅ (рядок 99-103) FIX: використовуємо extract_file_id 🟢
file_id="$(extract_file_id "$URL_ARG")"

if [ -z "$file_id" ]; then
    log "❌ Не вдалося витягти File ID з URL: $URL_ARG"
    exit 1
fi

log "✅ File ID: $file_id"
log "Token: $(mask_token "$FIGMA_TOKEN")"

OUT_JSON="$LOG_DIR/figma-${file_id}_$(date +%Y%m%d_%H%M%S).json"

log "ℹ️ Виконуємо запит до Figma API..."
http_code=$(curl -sS -w "%{http_code}" -H "X-FIGMA-TOKEN: $FIGMA_TOKEN" "https://api.figma.com/v1/files/$file_id" -o "$OUT_JSON") || {
    log "❌ curl не виконався"
    exit 1
}

log "HTTP Code: $http_code"
if [ "$http_code" -ne 200 ]; then
    log "❌ Figma API повернув HTTP $http_code. Перевірте токен та ID. Файл з відповіддю: $OUT_JSON"
    exit 1
fi

log "✅ Figma файл збережено: $OUT_JSON"

if command -v jq >/dev/null 2>&1; then
    title=$(jq -r '.name // "N/A"' "$OUT_JSON" 2>/dev/null || echo "N/A")
    log "ℹ️ Назва файлу: $title"
fi

echo
log "Скрипт завершив роботу успішно."

exit 0
