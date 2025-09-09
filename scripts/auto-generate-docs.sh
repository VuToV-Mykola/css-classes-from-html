#!/bin/bash
# Генерація документації на трьох мовах

echo "📚 Генерація документації..."

# README.md (Українська)
cat > README.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Автоматична генерація CSS класів з HTML файлів з інтеграцією Figma.

## Встановлення
```bash
npm install
```

## Використання
1. Відкрийте HTML файл
2. Запустіть команду "CSS Classes from HTML: Show Menu"
3. Виберіть режим генерації
4. Отримайте готовий CSS файл

## Ліцензія
MIT
EOMD

# README.en.md (English)
cat > README.en.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Automatic CSS class generation from HTML files with Figma integration. Developed using knowledge from GoIT courses and AI.

## Installation
```bash
npm install
```

## Usage
1. Open HTML file
2. Run command "CSS Classes from HTML: Show Menu"
3. Choose generation mode
4. Get ready CSS file

## License
MIT
EOMD

# README.de.md (Deutsch)
cat > README.de.md << 'EOMD'
### 🌐 Виберіть мову/Choose language/Wählen Sprache:
[🇺🇦 Українська](README.md) | [🇬🇧 English](README.en.md) | [🇩🇪 Deutsch](README.de.md)

# CSS Classes from HTML

📌 Automatische CSS-Klassengenerierung aus HTML-Dateien mit Figma-Integration. Entwickelt mit GoIT-Kursen und KI.

## Installation
```bash
npm install
```

## Verwendung
1. HTML-Datei öffnen
2. Befehl "CSS Classes from HTML: Show Menu" ausführen
3. Generierungsmodus wählen
4. Fertige CSS-Datei erhalten

## Lizenz
MIT
EOMD

echo "✅ Документація згенерована"
