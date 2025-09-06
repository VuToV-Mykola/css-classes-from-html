#!/bin/bash

# ✅ Діагностика проблем з підключенням до Figma API
# 🚀 Детальна перевірка мережі, проксі та firewall

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}🚀 $1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Функція перевірки базового мережевого підключення
check_network_connectivity() {
    print_header "🌐 Перевірка мережевого підключення"
    
    # Перевірка інтернет-з'єднання
    print_info "Перевірка доступу в інтернет..."
    if ping -c 2 -W 2 8.8.8.8 > /dev/null 2>&1; then
        print_success "Інтернет-з'єднання є"
    else
        print_error "Немає інтернет-з'єднання"
        return 1
    fi
    
    # Перевірка DNS
    print_info "Перевірка DNS..."
    if nslookup api.figma.com > /dev/null 2>&1; then
        print_success "DNS працює коректно"
    else
        print_warning "Проблеми з DNS. Спробуємо визначити IP адресу..."
        local figma_ip=$(dig +short api.figma.com | head -1)
        if [ -n "$figma_ip" ]; then
            print_success "IP адреса api.figma.com: $figma_ip"
        else
            print_error "Не вдалося визначити IP адресу Figma API"
        fi
    fi
    
    return 0
}

# Функція перевірки доступу до Figma API
check_figma_access() {
    print_header "🔗 Перевірка доступу до Figma API"
    
    local test_urls=(
        "https://api.figma.com"
        "https://api.figma.com/v1/"
        "https://api.figma.com/health"
    )
    
    for url in "${test_urls[@]}"; do
        print_info "Перевірка: $url"
        
        # Використовуємо curl з різними параметрами
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url")
        local curl_exit_code=$?
        
        case $curl_exit_code in
            0)
                if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 403 ] || [ "$http_code" -eq 401 ]; then
                    print_success "Доступ є (HTTP $http_code)"
                else
                    print_warning "Сторінка повернула код: $http_code"
                fi
                ;;
            6)  print_error "Не вдалося розпізнати хост. Проблеми з DNS" ;;
            7)  print_error "Не вдалося підключитися. Мережева помилка" ;;
            28) print_error "Таймаут підключення. Фаєрвол або проксі?" ;;
            35) print_error "SSL помилка. Проблеми з сертифікатами" ;;
            56) print_error "Помилка отримання мережевих даних" ;;
            *)  print_error "Помилка curl: $curl_exit_code" ;;
        esac
        
        # Додаткова інформація
        if [ $curl_exit_code -ne 0 ]; then
            print_info "Детальна діагностика для: $url"
            
            # Перевірка з verbose
            echo -e "${YELLOW}--- Детальний вивід curl ---${NC}"
            curl -v --connect-timeout 5 "$url" 2>&1 | head -20
            echo -e "${YELLOW}----------------------------${NC}"
        fi
    done
}

# Функція перевірки проксі та фаєрвола
check_proxy_firewall() {
    print_header "🛡️ Перевірка проксі та фаєрвола"
    
    # Перевірка змінних середовища проксі
    print_info "Перевірка налаштувань проксі..."
    local proxy_vars=("HTTP_PROXY" "HTTPS_PROXY" "http_proxy" "https_proxy")
    
    for var in "${proxy_vars[@]}"; do
        if [ -n "${!var}" ]; then
            print_warning "Знайдено проксі: $var=${!var}"
        fi
    done
    
    # Перевірка можливості підключення без проксі
    print_info "Перевірка підключення без проксі..."
    env -i /bin/bash -c 'curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://api.figma.com/health'
    local no_proxy_code=$?
    
    if [ $no_proxy_code -eq 0 ]; then
        print_success "Підключення без проксі працює"
    else
        print_warning "Проблеми навіть без проксі"
    fi
    
    # Перевірка портів
    print_info "Перевірка відкритих портів..."
    if command -v nc &> /dev/null; then
        if nc -z -w 2 api.figma.com 443; then
            print_success "Порт 443 відкритий"
        else
            print_error "Порт 443 заблокований"
        fi
    else
        print_warning "nc (netcat) не встановлено, перевірка портів неможлива"
    fi
}

# Функція перевірки SSL сертифікатів
check_ssl_certificates() {
    print_header "🔐 Перевірка SSL сертифікатів"
    
    print_info "Перевірка SSL з'єднання з Figma..."
    if openssl s_client -connect api.figma.com:443 -servername api.figma.com < /dev/null 2>&1 | grep -q "Verify return code"; then
        print_success "SSL з'єднання можливе"
    else
        print_error "Проблеми з SSL з'єднанням"
        
        # Перевірка сертифікатів
        print_info "Перевірка сертифіката..."
        openssl s_client -connect api.figma.com:443 -servername api.figma.com < /dev/null 2>&1 | grep "Verify return code"
    fi
}

# Функція перевірки IPv6
check_ipv6() {
    print_header "📡 Перевірка IPv6"
    
    if curl -6 -s -o /dev/null -w "%{http_code}" --connect-timeout 3 https://api.figma.com/health 2>/dev/null; then
        print_success "IPv6 підключення працює"
    else
        print_info "IPv6 не доступне або вимкнене"
    fi
}

# Функція альтернативних тестів
alternative_tests() {
    print_header "🔧 Альтернативні методи тестування"
    
    # Тест через різні IP версії
    print_info "Тест через IPv4..."
    curl -4 -s -o /dev/null -w "IPv4: %{http_code}\n" --connect-timeout 5 https://api.figma.com/health
    
    # Тест з різними User-Agent
    print_info "Тест з різними User-Agent..."
    curl -s -o /dev/null -w "Default UA: %{http_code}\n" --connect-timeout 3 https://api.figma.com/health
    curl -s -o /dev/null -w "Chrome UA: %{http_code}\n" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" --connect-timeout 3 https://api.figma.com/health
    
    # Тест з різними методами
    print_info "Тест різних HTTP методів..."
    curl -s -o /dev/null -w "GET: %{http_code}\n" -X GET --connect-timeout 3 https://api.figma.com/health
    curl -s -o /dev/null -w "HEAD: %{http_code}\n" -X HEAD --connect-timeout 3 https://api.figma.com/health
}

# Функція перевірки системних налаштувань
check_system_settings() {
    print_header "💻 Перевірка системних налаштувань"
    
    # Перевірка hosts файлу
    print_info "Перевірка /etc/hosts..."
    if grep -q "figma.com" /etc/hosts 2>/dev/null; then
        print_warning "Знайдено записи Figma в /etc/hosts:"
        grep "figma.com" /etc/hosts
    fi
    
    # Перевірка firewall
    print_info "Перевірка фаєрвола..."
    if command -v ufw &> /dev/null; then
        print_info "UFW статус:"
        ufw status | head -5
    fi
    
    if command -v firewall-cmd &> /dev/null; then
        print_info "FirewallD статус:"
        firewall-cmd --state 2>/dev/null || echo "FirewallD не активний"
    fi
    
    # Перевірка мережевих інтерфейсів
    print_info "Активні мережеві інтерфейси:"
    ip addr show | grep "state UP" | head -3
}

# Функція вирішення проблем
suggest_solutions() {
    print_header "🛠️ Можливі рішення"
    
    echo -e "${YELLOW}1. 🔄 Перевірте інтернет-з'єднання${NC}"
    echo "   - Перезавантажте роутер"
    echo "   - Перевірте кабель/Wi-Fi"
    
    echo -e "${YELLOW}2. 🛡️ Вимкніть фаєрвол тимчасово${NC}"
    echo "   sudo ufw disable  # Ubuntu"
    echo "   systemctl stop firewalld  # CentOS"
    
    echo -e "${YELLOW}3. 🔄 Скиньте налаштування проксі${NC}"
    echo "   unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy"
    
    echo -e "${YELLOW}4. 📡 Перевірте DNS${NC}"
    echo "   Спробуйте використати DNS 8.8.8.8 або 1.1.1.1"
    
    echo -e "${YELLOW}5. 🌐 Використайте VPN${NC}"
    echo "   - Змініть мережеве середовище"
    echo "   - Використайте мобільний інтернет"
    
    echo -e "${YELLOW}6. 🔧 Оновіть SSL сертифікати${NC}"
    echo "   sudo apt-get update && sudo apt-get install ca-certificates"
    
    echo -e "${YELLOW}7. 📞 Зверніться до мережевого адміністратора${NC}"
    echo "   - Можливо, Figma API заблоковано в мережі"
}

# Головна функція діагностики
main_diagnostic() {
    print_header "🔍 Повна діагностика підключення до Figma API"
    
    # Перевірка залежностей
    local deps=("curl" "ping" "nslookup" "dig" "openssl")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            print_warning "$dep не знайдено, деякі перевірки будуть пропущені"
        fi
    done
    
    # Виконуємо всі перевірки
    check_network_connectivity
    echo
    
    check_figma_access
    echo
    
    check_proxy_firewall
    echo
    
    check_ssl_certificates
    echo
    
    check_ipv6
    echo
    
    check_system_settings
    echo
    
    alternative_tests
    echo
    
    suggest_solutions
    echo
    
    print_header "📋 Швидкий тест"
    print_info "Виконайте цю команду для швидкої перевірки:"
    echo -e "${CYAN}curl -v -X GET 'https://api.figma.com/health'${NC}"
    echo
    print_info "Якщо працює, спробуйте з токеном:"
    echo -e "${CYAN}curl -v -H 'X-FIGMA-TOKEN: ваш_токен' 'https://api.figma.com/v1/files/тестовий_id'${NC}"
}

# Функція швидкого тесту
quick_test() {
    print_header "⚡ Швидкий тест"
    
    echo -e "${CYAN}Тест 1: Базове підключення${NC}"
    if curl -s -o /dev/null -w "Код: %{http_code}\n" --connect-timeout 5 https://api.figma.com/health; then
        print_success "Базове підключення працює"
    else
        print_error "Базове підключення не працює"
    fi
    
    echo -e "${CYAN}Тест 2: З токеном (ожидається 404)${NC}"
    local test_file_id="test123"
    local test_token="invalid_token"
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-FIGMA-TOKEN: $test_token" \
        --connect-timeout 5 \
        "https://api.figma.com/v1/files/$test_file_id")
    
    if [ "$response" -eq 404 ] || [ "$response" -eq 403 ] || [ "$response" -eq 401 ]; then
        print_success "API відповідає (код: $response)"
    else
        print_error "API не відповідає (код: $response)"
    fi
}

# Запуск діагностики
main_diagnostic
echo
quick_test

print_header "📊 Результати діагностики"
print_info "Якщо проблеми залишаються, спробуйте:"
echo "1. Використати VPN"
echo "2. Перевірити корпоративний фаєрвол" 
echo "3. Звернутися до IT відділу"
echo "4. Використати інше мережеве середовище"