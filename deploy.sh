#!/bin/bash
# deploy.sh - Автоматичне розгортання CSS Classes from HTML
# @version 3.0.0
# @author VuToV-Mykola

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Змінні
PROJECT_NAME="css-classes-from-html"
VERSION="0.0.7"
LOG_DIR="log"
OUTPUT_DIR="output"
BUILD_DIR="build"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/deploy_$TIMESTAMP.log"

# Функція логування
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Функція перевірки помилок
check_error() {
    if [ $? -ne 0 ]; then
        log "${RED}❌ Помилка: $1${NC}"
        exit 1
    fi
}

# Заголовок
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          CSS Classes from HTML - Deployment Script          ║"
echo "║                      Version: $VERSION                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Створення директорій
log "${YELLOW}📁 Створення необхідних директорій...${NC}"
mkdir -p "$LOG_DIR" "$OUTPUT_DIR" "$BUILD_DIR" ".vscode/css-classes-config"
check_error "Не вдалось створити директорії"

# Перевірка залежностей
log "${YELLOW}🔍 Перевірка системних залежностей...${NC}"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "${GREEN}✓ Node.js знайдено: $NODE_VERSION${NC}"
else
    log "${RED}❌ Node.js не встановлено${NC}"
    exit 1
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log "${GREEN}✓ npm знайдено: $NPM_VERSION${NC}"
else
    log "${RED}❌ npm не встановлено${NC}"
    exit 1
fi

# VS Code
if command -v code &> /dev/null; then
    CODE_VERSION=$(code --version | head -n 1)
    log "${GREEN}✓ VS Code знайдено: $CODE_VERSION${NC}"
else
    log "${YELLOW}⚠️ VS Code CLI не знайдено (опціонально)${NC}"
fi

# Встановлення npm залежностей
log "${YELLOW}📦 Встановлення npm залежностей...${NC}"
npm install --production 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось встановити npm залежності"

# Встановлення dev залежностей
log "${YELLOW}📦 Встановлення dev залежностей...${NC}"
npm install --save-dev @types/vscode @vscode/test-electron @vscode/vsce 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось встановити dev залежності"

# Перевірка основних файлів
log "${YELLOW}📝 Перевірка структури проєкту...${NC}"

REQUIRED_FILES=(
    "extension.js"
    "package.json"
    "frontend/css-classes-from-html-menu.html"
    "frontend/configurationManager.js"
    "core/FigmaAPIClient.js"
    "core/HTMLParser.js"
    "core/StyleMatcher.js"
    "core/CSSGenerator.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "${GREEN}✓ $file${NC}"
    else
        log "${RED}❌ Відсутній файл: $file${NC}"
        exit 1
    fi
done

# Перевірка синтаксису JavaScript
log "${YELLOW}🔧 Перевірка синтаксису JavaScript...${NC}"
for file in extension.js core/*.js frontend/*.js; do
    if [ -f "$file" ]; then
        node -c "$file" 2>&1 | tee -a "$LOG_FILE"
        if [ $? -eq 0 ]; then
            log "${GREEN}✓ Синтаксис $file валідний${NC}"
        else
            log "${RED}❌ Помилка синтаксису в $file${NC}"
            exit 1
        fi
    fi
done

# Створення тестового HTML файлу
log "${YELLOW}📄 Створення тестового HTML файлу...${NC}"
cat > "test/test.html" << 'EOF'
<!doctype html>
<!-- Українською: Декларація типу документу HTML5 / English: HTML5 document type declaration -->
<html lang="en">
  <!-- Українською: Вказує мову сторінки / English: Specifies page language -->
  <!--!!! HEAD !!!-->
  <head>
    <meta charset="UTF-8">
    <!-- Українською: Кодування символів (UTF-8 підтримує всі мови) / English: Character encoding (UTF-8 supports all languages) -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Українською: Налаштування адаптивного дизайну / English: Responsive design settings -->
    <!--!!! TITLE !!!-->
    <title>WEBSTUDIO</title>
    <!-- Українською: Заголовок сторінки (вкладка браузера) / English: Page title (browser tab) -->
    <!--!!! MODERN NORMALIZE !!!-->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/3.0.1/modern-normalize.css"
      integrity="sha512-gnAN+RgTMylunXI7AMg+PtcUGpKZFkZJoFIkAWvdPFRrFJz3p2tx4+9xbjILRfN7CzoViMgS8vSf06fSQzWZjA=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer">
    <!--!!! FONTS !!!-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
      href="https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Roboto:wght@400;500;700&display=swap"
      rel="stylesheet">
    <!--!!! STYLES !!!-->
    <link rel="stylesheet" href="./css/style.css">
    <!-- Українською: Підключення CSS стилів / English: CSS stylesheet link -->
  </head>
  <!--!!! BODY !!!-->
  <body class="page">
    <!-- Українською: Універсальний контейнер / English: Universal container -->
    <!--!!! HEADER !!!-->
    <header class="header">
      <!-- Українською: Верхня частина сторінки (лого, навігація) / English: Top section (logo, navigation) -->
      <div class="container">
        <!-- Українською: Універсальний контейнер / English: Universal container -->
        <nav class="nav">
          <!-- Українською: Блок навігації / English: Navigation block -->
          <!-- !!!Logo!!! -->
          <a class="logo" href="./index.html" target="_self" rel="noopener"
            >Web<span class="accent">Studio</span></a
          >
          <ul class="nav-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <li class="nav-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="nav-link current" href="./index.html">
                <!-- Українською: Навігаційне посилання / English: Navigation link -->
                Studio
              </a>
            </li>
            <li class="nav-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="nav-link" href="#portfolio-id">
                <!-- Українською: Навігаційне посилання / English: Navigation link -->
                Portfolio
              </a>
            </li>
            <li class="nav-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="nav-link" href="">
                <!-- Українською: Навігаційне посилання / English: Navigation link -->
                Contacts
              </a>
            </li>
          </ul>
        </nav>
        <address class="contacts">
          <!-- Українською: Контактна інформація / English: Contact Information -->
          <ul class="contacts-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <li class="contacts-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a
                class="contacts-link"
                href="mailto:info@devstudio.com"
                target="_blank"
                rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                info@devstudio.com
              </a>
            </li>
            <li class="contacts-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="contacts-link" href="tel:+110001111111" target="_blank" rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                +11 (000) 111-11-11
              </a>
            </li>
          </ul>
        </address>
      </div>
      <!-- !!!Navigation!!! -->
    </header>
    <!--!!! MAIN !!!-->
    <main class="main">
      <!-- Українською: Основний вміст сторінки / English: Main page content -->

      <!-- !!!section HERO!!! -->
      <section class="hero section">
        <!-- Українською: Тематична група контенту / English: Thematic content group -->
        <div class="container">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <h1 class="hero-title" id="studio">Effective Solutions for Your Business</h1>
          <button class="hero-btn" type="button">
            <!-- Українською: Кнопка / English: Button -->
            Order Service
          </button>
        </div>
      </section>

      <!-- !!!section FEATURE!!! -->
      <section class="features section">
        <!-- Українською: Тематична група контенту / English: Thematic content group -->
        <div class="container">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <h2 class="features-title visually-hidden" id="portfolio">FEATURE</h2>
          <ul class="features-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <li class="features-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="icon-container">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <svg class="icon" width="64" height="64">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-antenna"></use>
                </svg>
              </div>
              <h3 class="features-subtitle">
                <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                Strategy
              </h3>
              <p class="features-text">
                <!-- Українською: Абзац / English: Paragraph -->
                Our goal is to identify the business problem to walk away with the perfect and
                creative solution.
              </p>
            </li>
            <li class="features-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="icon-container">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <svg class="icon" width="64" height="64">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-clock"></use>
                </svg>
              </div>
              <h3 class="features-subtitle">
                <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                Punctuality
              </h3>

              <p class="features-text">
                <!-- Українською: Абзац / English: Paragraph -->
                Bring the key message to the brand's audience for the best price within the shortest
                possible time.
              </p>
            </li>
            <li class="features-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="icon-container">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <svg class="icon" width="64" height="64">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-diagram"></use>
                </svg>
              </div>
              <h3 class="features-subtitle">
                <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                Diligence
              </h3>
              <p class="features-text">
                <!-- Українською: Абзац / English: Paragraph -->
                Research and confirm brands with the strongest digital growth opportunities and
                minimize risk.
              </p>
            </li>
            <li class="features-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="icon-container">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <svg class="icon" width="64" height="64">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-astronaut"></use>
                </svg>
              </div>
              <h3 class="features-subtitle">
                <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                Technologies
              </h3>

              <p class="features-text">
                <!-- Українською: Абзац / English: Paragraph -->
                Design practice focused on digital experiences. We bring forth a deep passion for
                problem-solving.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <!-- !!!section OUR TEAM!!! -->
      <section class="team section">
        <!-- Українською: Тематична група контенту / English: Thematic content group -->
        <div class="container">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <h2 class="team-title" id="contacts">Our Team</h2>
          <ul class="team-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <!-- !!!!card Mark Guerrero!!!! -->
            <li class="team-item">
              <!-- Українською: Елемент списку / English: List item -->
              <img
                class="team-img"
                src="./images/img-1.jpg"
                alt="foto Mark Guerrero"
                width="264"
                height="260">
              <!-- Українською: Зображення / English: Image -->
              <div class="team-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="team-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Mark Guerrero
                </h3>
                <p class="team-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Product Designer
                </p>

                <ul class="social">
                  <!-- Українською: Ненумерований список / English: Unordered List -->
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-instagram"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-twitter"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-facebook"></use>
                      </svg>
                    </a>
                  </li>
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-linkedin"></use>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <!-- !!!!card Tom Ford!!!! -->
            <li class="team-item">
              <!-- Українською: Елемент списку / English: List item -->
              <img
                class="team-img"
                src="./images/img-2.jpg"
                alt="foto Tom Ford"
                width="264"
                height="260">
              <!-- Українською: Зображення / English: Image -->
              <div class="team-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="team-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Tom Ford
                </h3>
                <p class="team-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Frontend Developer
                </p>

                <ul class="social">
                  <!-- Українською: Ненумерований список / English: Unordered List -->
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-instagram"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-twitter"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-facebook"></use>
                      </svg>
                    </a>
                  </li>
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-linkedin"></use>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <!-- !!!!card Camila Garcia!!!! -->
            <li class="team-item">
              <!-- Українською: Елемент списку / English: List item -->
              <img
                class="team-img"
                src="./images/img-3.jpg"
                alt="foto Camila Garcia"
                width="264"
                height="260">
              <!-- Українською: Зображення / English: Image -->
              <div class="team-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="team-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Camila Garcia
                </h3>
                <p class="team-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Marketing
                </p>

                <ul class="social">
                  <!-- Українською: Ненумерований список / English: Unordered List -->
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-instagram"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-twitter"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-facebook"></use>
                      </svg>
                    </a>
                  </li>
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-linkedin"></use>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <!-- !!!!card Daniel Wilson!!!! -->
            <li class="team-item">
              <!-- Українською: Елемент списку / English: List item -->
              <img
                class="team-img"
                src="./images/img-4.jpg"
                alt="foto Daniel Wilson"
                width="264"
                height="260">
              <!-- Українською: Зображення / English: Image -->
              <div class="team-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="team-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Daniel Wilson
                </h3>
                <p class="team-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  UI Designer
                </p>

                <ul class="social">
                  <!-- Українською: Ненумерований список / English: Unordered List -->
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-instagram"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-twitter"></use>
                      </svg>
                    </a>
                  </li>

                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-facebook"></use>
                      </svg>
                    </a>
                  </li>
                  <li class="social-item">
                    <!-- Українською: Елемент списку / English: List item -->
                    <a class="social-link" href="#" target="_self" rel="noopener">
                      <!-- Українською: Гіперпосилання / English: Hyperlink -->
                      <svg class="social-icon" width="16" height="16">
                        <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                        <use href="./images/icons.svg#icon-linkedin"></use>
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <!-- !!!section portfolio!!! -->
      <section class="portfolio section" id="portfolio-id">
        <!-- Українською: Тематична група контенту / English: Thematic content group -->
        <div class="container">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <h2 class="portfolio-title" id="page-section-id">Our Portfolio</h2>
          <ul class="portfolio-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-11.jpg"
                  alt="Mobile banking app interface design showing purple-themed BankApp with multiple screens including login, dashboard, transactions, and analytics views displayed on smartphone mockups"
                  width="360"
                  height="300">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Banking App
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  App
                </p>
              </div>
            </li>
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-12.jpg"
                  alt="Hand holding smartphone displaying QR code scanner interface next to payment terminal device for contactless mobile payment transaction"
                  width="360"
                  height="300">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Cashless Payment
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Marketing
                </p>
              </div>
            </li>
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-13.jpg"
                  alt="Laptop and smartphone displaying matching gradient website design with 'Return to Normalcy' heading and modern UI elements in orange and blue colors"
                  width="360"
                  height="300">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Meditation App
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  App
                </p>
              </div>
            </li>
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-14.jpg"
                  alt="Interior view of car dashboard with smartphone mounted on holder showing navigation app while driving, hands on steering wheel visible"
                  width="360"
                  height="300">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Taxi Service
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Marketing
                </p>
              </div>
            </li>
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-15.jpg"
                  alt="Smartphone lock screen showing time 09:25 with mystical blue moon landscape wallpaper, alongside collection of similar fantasy-themed mobile wallpapers"
                  width="360">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Screen Illustrations
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Design
                </p>
              </div>
            </li>
            <li class="portfolio-item">
              <!-- Українською: Елемент списку / English: List item -->
              <div class="portfolio-wrap">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <img
                  class="portfolio-img"
                  src="./images/img-16.jpg"
                  alt="Smiling young woman wearing gray beanie and orange knit sweater, holding smartphone while walking outdoors in urban setting with yellow-tinted sunglasses"
                  width="360"
                  height="300">
                <!-- Українською: Зображення / English: Image -->
                <p class="overlay">
                  14 Stylish and User-Friendly App Design Concepts · Task Manager App · Calorie
                  Tracker App · Exotic Fruit Ecommerce App · Cloud Storage App
                </p>
              </div>

              <div class="portfolio-descr">
                <!-- Українською: Універсальний контейнер / English: Universal container -->
                <h3 class="portfolio-subtitle">
                  <!-- Українською: Заголовок 3 рівня / English: Heading level 3 -->
                  Online Courses
                </h3>
                <p class="portfolio-text">
                  <!-- Українською: Абзац / English: Paragraph -->
                  Marketing
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>
    <!--!!! FOOTER !!!-->
    <footer class="footer">
      <!-- Українською: Нижня частина сторінки (копірайт, посилання) / English: Bottom section (copyright, links) -->
      <div class="container">
        <!-- Українською: Універсальний контейнер / English: Universal container -->
        <div class="logo-container">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <!-- !!!Logo!!! -->
          <a class="footer-logo" href="./index.html" target="_self" rel="noopener"
            >Web<span class="accent-footer">Studio</span></a
          >
          <p class="footer-text">
            <!-- Українською: Абзац / English: Paragraph -->
            Increase the flow of customers and sales for your business with digital marketing &
            growth solutions.
          </p>
        </div>

        <div class="footer-social">
          <!-- Українською: Універсальний контейнер / English: Universal container -->
          <p class="footer-social-text">
            <!-- Українською: Абзац / English: Paragraph -->
            Social media
          </p>
          <ul class="footer-social-list">
            <!-- Українською: Ненумерований список / English: Unordered List -->
            <li class="footer-social-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="footer-social-link" href="#" target="_self" rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                <svg class="footer-icon" width="24" height="24">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-instagram"></use>
                </svg>
              </a>
            </li>

            <li class="footer-social-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="footer-social-link" href="#" target="_self" rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                <svg class="footer-icon" width="24" height="24">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-twitter"></use>
                </svg>
              </a>
            </li>

            <li class="footer-social-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="footer-social-link" href="#" target="_self" rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                <svg class="footer-icon" width="24" height="24">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-facebook"></use>
                </svg>
              </a>
            </li>
            <li class="footer-social-item">
              <!-- Українською: Елемент списку / English: List item -->
              <a class="footer-social-link" href="#" target="_self" rel="noopener">
                <!-- Українською: Гіперпосилання / English: Hyperlink -->
                <svg class="footer-icon" width="24" height="24">
                  <!-- Українською: Використання іконки з спрайту / English: Using icon from sprite -->
                  <use href="./images/icons.svg#icon-linkedin"></use>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <!-- Українською: Універсальний контейнер / English: Universal container -->
    </footer>
  </body>
</html>

EOF
check_error "Не вдалось створити тестовий HTML файл"

# Запуск тестів
log "${YELLOW}🧪 Запуск тестів...${NC}"
if [ -f "test/runTest.js" ]; then
    node test/runTest.js 2>&1 | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ Тести пройдено успішно${NC}"
    else
        log "${YELLOW}⚠️ Деякі тести не пройдено${NC}"
    fi
fi

# Створення VSIX пакету (якщо встановлено vsce)
if command -v vsce &> /dev/null; then
    log "${YELLOW}📦 Створення VSIX пакету...${NC}"
    vsce package --out "$BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix" 2>&1 | tee -a "$LOG_FILE"
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ VSIX пакет створено: $BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix${NC}"
    else
        log "${YELLOW}⚠️ Не вдалось створити VSIX пакет${NC}"
    fi
else
    log "${YELLOW}⚠️ vsce не встановлено. Встановіть за допомогою: npm install -g @vscode/vsce${NC}"
fi

# Створення backup
log "${YELLOW}💾 Створення backup...${NC}"
BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}.tar.gz"
tar -czf "$BUILD_DIR/$BACKUP_NAME" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=build \
    --exclude=output \
    --exclude=log \
    . 2>&1 | tee -a "$LOG_FILE"
check_error "Не вдалось створити backup"
log "${GREEN}✓ Backup створено: $BUILD_DIR/$BACKUP_NAME${NC}"

# Генерація звіту
log "${YELLOW}📊 Генерація звіту...${NC}"
REPORT_FILE="$LOG_DIR/deployment_report_${TIMESTAMP}.txt"
cat > "$REPORT_FILE" << EOF
=====================================
CSS Classes from HTML - Deployment Report
=====================================
Date: $(date)
Version: $VERSION
Node.js: $NODE_VERSION
npm: $NPM_VERSION

Files Status:
$(for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file"
    fi
done)

Directories:
$(ls -la | grep "^d")

Package Info:
$(npm list --depth=0 2>/dev/null || echo "No packages info available")

=====================================
EOF
log "${GREEN}✓ Звіт збережено: $REPORT_FILE${NC}"

# Фінальна статистика
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   🎉 Deployment Complete 🎉                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "${GREEN}📊 Статистика:${NC}"
log "   • Файлів перевірено: ${#REQUIRED_FILES[@]}"
log "   • Логи збережено в: $LOG_FILE"
log "   • Звіт збережено в: $REPORT_FILE"
if [ -f "$BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix" ]; then
    log "   • VSIX пакет: $BUILD_DIR/${PROJECT_NAME}-${VERSION}.vsix"
fi
log "   • Backup: $BUILD_DIR/$BACKUP_NAME"

echo ""
log "${YELLOW}📋 Наступні кроки:${NC}"
log "1. Відкрийте VS Code"
log "2. Натисніть F5 для запуску розширення в debug режимі"
log "3. У новому вікні VS Code відкрийте HTML файл"
log "4. Натисніть Ctrl+Shift+P та виберіть 'CSS Classes: Show Main Menu'"

echo ""
log "${GREEN}✅ Deployment завершено успішно!${NC}"

# Запит на відкриття VS Code
read -p "Відкрити проєкт у VS Code? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    code .
fi