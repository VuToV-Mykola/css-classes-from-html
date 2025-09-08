#!/bin/bash

# 📚 Generate Documentation Script for CSS Classes from HTML
# Автоматична генерація багатомовної документації
# Author: VuToV-Mykola
# Version: 0.0.7

set -e

# 🎨 Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📚 Генерація документації...${NC}"

# ✅ README.en.md (English)
cat > README.en.md << 'EOF'
# 🚀 CSS Classes from HTML - Enhanced Deploy Script

### 🌐 Choose language/Виберіть мову/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

## 📌 Description

Automated deploy script for VS Code extension with real Figma integration. Includes automatic command validation and error fixing, VS Code ^1.103.0 support, and comprehensive logging.

## ✨ Key Features

- **🔍 Project Structure Analysis** - validates all required files
- **⚡ Command Validation** - automatic detection of command registration issues
- **🔧 Auto-Fix** - resolves `Command * not found` errors
- **📦 VSIX Package Creation** - ready for publishing
- **🐙 GitHub Integration** - automatic push and tagging
- **🏪 Marketplace Publishing** - VS Code Marketplace integration
- **📋 Detailed Reports** - comprehensive logging and statistics

## 🚀 Quick Start

~~~text
# Clone and run
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
chmod +x deploy.sh
./deploy.sh
~~~

## 📋 Requirements

- **Node.js** 18+
- **npm** 9+
- **VS Code** ^1.103.0
- **vsce** 2+ (installs automatically)
- **Git** for GitHub push

## ⚡ Auto-Fix Commands

Automatically fixes these command-related errors:

### 🔍 **Detects Issues:**
- ❌ `Command * resulted in an error: command * not found`
- ❌ Commands in `package.json` but missing in `extension.js`
- ❌ Commands in `extension.js` but missing in `package.json`
- ❌ Missing `activationEvents`
- ❌ Missing `activate` function

### 🔧 **Auto-Fixes:**
- ✅ Adds missing commands to `extension.js`
- ✅ Adds missing commands to `package.json`
- ✅ Creates `activationEvents`
- ✅ Generates `activate` and `deactivate` functions
- ✅ Validates syntax after fixes

## 🐛 Troubleshooting

### Command Errors:
~~~text
# Auto-fix
./deploy.sh

# Manual check
node -c extension.js
npm run validate
~~~

## 🏆 Author

**VuToV-Mykola** - Certified programmer with 10+ years experience  
Developed using AI and GoIT knowledge

## 📜 License

MIT License - free to use and modify

---

## 🚀 Quick Push Command:

~~~text
git add --all && git commit -m "🚀 Enhanced deploy script v0.0.7 with command validation" && git push --force
~~~
EOF

# ✅ README.de.md (Deutsch)
cat > README.de.md << 'EOF'
# 🚀 CSS Classes from HTML - Enhanced Deploy Script

### 🌐 Sprache wählen/Choose language/Виберіть мову:
[🇺🇦 Ukrainisch](README.md) | [🇬🇧 Englisch](README.en.md) | [🇩🇪 Deutsch](README.de.md)

## 📌 Beschreibung

Automatisiertes Deploy-Skript für VS Code-Erweiterung mit echter Figma-Integration. Enthält automatische Befehls-Validierung und Fehlerkorrektur, VS Code ^1.103.0-Unterstützung und umfassendes Logging.

## ✨ Hauptfunktionen

- **🔍 Projektstruktur-Analyse** - validiert alle erforderlichen Dateien
- **⚡ Befehls-Validierung** - automatische Erkennung von Befehls-Registrierungsproblemen
- **🔧 Auto-Fix** - behebt `Command * not found` Fehler
- **📦 VSIX-Paket-Erstellung** - bereit für Veröffentlichung
- **🐙 GitHub-Integration** - automatischer Push und Tagging
- **🏪 Marketplace-Veröffentlichung** - VS Code Marketplace-Integration
- **📋 Detaillierte Berichte** - umfassendes Logging und Statistiken

## 🚀 Schnellstart

~~~text
# Klonen und ausführen
git clone https://github.com/VuToV-Mykola/css-classes-from-html.git
cd css-classes-from-html
chmod +x deploy.sh
./deploy.sh
~~~

## 📋 Anforderungen

- **Node.js** 18+
- **npm** 9+
- **VS Code** ^1.103.0
- **vsce** 2+ (wird automatisch installiert)
- **Git** für GitHub Push

## ⚡ Auto-Fix Befehle

Behebt automatisch diese befehlsbezogenen Fehler:

### 🔍 **Erkennt Probleme:**
- ❌ `Command * resulted in an error: command * not found`
- ❌ Befehle in `package.json` aber fehlen in `extension.js`
- ❌ Befehle in `extension.js` aber fehlen in `package.json`
- ❌ Fehlende `activationEvents`
- ❌ Fehlende `activate` Funktion

### 🔧 **Auto-Korrekturen:**
- ✅ Fügt fehlende Befehle zu `extension.js` hinzu
- ✅ Fügt fehlende Befehle zu `package.json` hinzu
- ✅ Erstellt `activationEvents`
- ✅ Generiert `activate` und `deactivate` Funktionen
- ✅ Validiert Syntax nach Korrekturen

## 🐛 Fehlerbehebung

### Befehlsfehler:
~~~text
# Auto-Fix
./deploy.sh

# Manuelle Überprüfung
node -c extension.js
npm run validate
~~~

## 🏆 Autor

**VuToV-Mykola** - Zertifizierter Programmierer mit 10+ Jahren Erfahrung  
Entwickelt mit KI und GoIT-Wissen

## 📜 Lizenz

MIT-Lizenz - frei zu verwenden und zu modifizieren

---

## 🚀 Schneller Push-Befehl:

~~~text
git add --all && git commit -m "🚀 Enhanced deploy script v0.0.7 with command validation" && git push --force
~~~
EOF

# ✅ GitHub About sections
cat > github-about.txt << 'EOF'
📌 Українська (160 chars):
Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma. Розроблено завдячуючи знанням отриманим на курсах GoIT з використанням ШІ.

📌 English (160 chars):
Automatic CSS class generation from HTML files with Figma integration. Developed using knowledge from GoIT courses with AI assistance.

📌 Deutsch (160 chars):
Automatische CSS-Klassen-Generierung aus HTML-Dateien mit Figma-Integration. Entwickelt mit GoIT-Kurswissen und KI-Unterstützung.
EOF

# ✅ GitHub Topics
cat > github-topics.txt << 'EOF'
vscode-extension css-generator html-parser figma-integration frontend-tools web-development css-automation javascript nodejs ui-generator design-tools
EOF

echo -e "${GREEN}✅ README.en.md створено${NC}"
echo -e "${GREEN}✅ README.de.md створено${NC}"
echo -e "${GREEN}✅ github-about.txt створено${NC}"
echo -e "${GREEN}✅ github-topics.txt створено${NC}"

# ✅ Логування
mkdir -p logs
echo "$(date): Документація згенерована автоматично" >> logs/docs-generation.log

echo -e "${YELLOW}📋 Наступні кроки:${NC}"
echo "1. Скопіювати вміст github-about.txt до About секції GitHub"
echo "2. Додати topics з github-topics.txt"
echo "3. Перевірити всі README файли"

echo -e "${BLUE}📚 Документація готова!${NC}"