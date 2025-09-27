#!/bin/bash

# 🚀 Smart Package Script для CSS Classes from HTML Extension
# Автор: VuToV-Mykola
# Версія: 1.0.0

set -e  # Зупинка при помилці

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція логування
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Функція очищення завислих процесів
cleanup_vsce() {
    log "🧹 Очищення завислих процесів vsce..."
    
    # Зупинка всіх процесів vsce
    pkill -f "vsce package" 2>/dev/null || true
    sleep 2
    
    # Перевірка чи залишились процеси
    if pgrep -f "vsce package" > /dev/null; then
        warning "Деякі процеси vsce все ще активні, примусове завершення..."
        pkill -9 -f "vsce package" 2>/dev/null || true
        sleep 1
    fi
    
    success "Процеси vsce очищені"
}

# Функція валідації проекту
validate_project() {
    log "🔍 Валідація проекту..."
    
    if [ ! -f "package.json" ]; then
        error "package.json не знайдено!"
        exit 1
    fi
    
    if [ ! -f "extension.js" ]; then
        error "extension.js не знайдено!"
        exit 1
    fi
    
    # Запуск валідації
    if npm run validate > /dev/null 2>&1; then
        success "Валідація пройшла успішно"
    else
        error "Валідація не пройшла!"
        exit 1
    fi
}

# Функція очищення кешу
clean_cache() {
    log "🗑️ Очищення кешу..."
    
    # Очищення npm кешу
    npm cache clean --force > /dev/null 2>&1 || true
    
    # Очищення кешу node_modules
    rm -rf node_modules/.cache 2>/dev/null || true
    
    success "Кеш очищено"
}

# Функція пакування з таймаутом
package_with_timeout() {
    local output_file="$1"
    local timeout_seconds=120
    
    log "📦 Початок пакування: $output_file"
    log "⏱️ Таймаут: ${timeout_seconds} секунд"
    
    # Створення тимчасового скрипта для таймауту
    cat > /tmp/vsce_package.sh << 'EOF'
#!/bin/bash
cd "$1"
exec npx vsce package --out "$2" --no-dependencies
EOF
    
    chmod +x /tmp/vsce_package.sh
    
    # Запуск з таймаутом через gtimeout (якщо встановлений) або альтернативний метод
    if command -v gtimeout > /dev/null; then
        # Використання gtimeout (встановлений через brew install coreutils)
        gtimeout $timeout_seconds /tmp/vsce_package.sh "$(pwd)" "$output_file"
    else
        # Альтернативний метод з background процесом
        /tmp/vsce_package.sh "$(pwd)" "$output_file" &
        local pid=$!
        
        # Чекаємо завершення або таймаут
        for i in $(seq 1 $timeout_seconds); do
            if ! kill -0 $pid 2>/dev/null; then
                wait $pid
                break
            fi
            sleep 1
        done
        
        # Якщо процес все ще працює, завершуємо його
        if kill -0 $pid 2>/dev/null; then
            warning "Таймаут досягнуто, завершення процесу..."
            kill $pid 2>/dev/null || true
            sleep 2
            kill -9 $pid 2>/dev/null || true
            error "Пакування не завершилось вчасно!"
            return 1
        fi
    fi
    
    # Очищення тимчасового файлу
    rm -f /tmp/vsce_package.sh
    
    # Перевірка результату
    if [ -f "$output_file" ]; then
        local file_size=$(ls -lh "$output_file" | awk '{print $5}')
        success "Пакування завершено успішно! Розмір: $file_size"
        return 0
    else
        error "Файл пакування не створено!"
        return 1
    fi
}

# Основна функція
main() {
    log "🚀 Запуск Smart Package Script"
    
    # Перевірка чи ми в правильній директорії
    if [ ! -d "scripts" ]; then
        error "Скрипт повинен запускатись з кореневої директорії проекту!"
        exit 1
    fi
    
    # Отримання параметрів
    local suffix="${1:-selective-loading}"
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local output_file="./builds/css-classes-from-html-0.0.7-${suffix}-${timestamp}.vsix"
    
    log "📁 Вихідний файл: $output_file"
    
    # Виконання кроків
    cleanup_vsce
    validate_project
    clean_cache
    
    # Створення директорії builds якщо не існує
    mkdir -p builds
    
    # Пакування
    if package_with_timeout "$output_file"; then
        success "🎉 Пакування завершено успішно!"
        log "📦 Файл: $output_file"
        
        # Показ інформації про файл
        ls -lh "$output_file"
        
        # Показ статистики builds директорії
        log "📊 Статистика builds директорії:"
        ls -1 builds/ | wc -l | xargs echo "Загальна кількість файлів:"
        du -sh builds/
        
    else
        error "❌ Пакування не вдалось!"
        exit 1
    fi
}

# Обробка сигналів для коректного завершення
trap 'cleanup_vsce; exit 130' INT TERM

# Запуск основної функції
main "$@"
