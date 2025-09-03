#!/bin/bash

# Оновлення README.md (українська версія)
sed -i '' 's|\[!\[⭐ Stars\](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)\](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)|[![⭐ Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html?style=for-the-badge)](https://github.com/VuToV-Mykola/css-classes-from-html/stargazers)|' README.md

# Оновлення README.en.md (англійська версія)
sed -i '' 's|\[!\[⭐ Stars\](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)\](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)|[![⭐ Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html?style=for-the-badge)](https://github.com/VuToV-Mykola/css-classes-from-html/stargazers)|' README.en.md

# Оновлення README.de.md (німецька версія)
sed -i '' 's|\[!\[⭐ Stars\](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/css-classes-from-html/main/assets/db/likes-badge.json)\](https://github.com/VuToV-Mykola/css-classes-from-html/actions/workflows/screenshot-and-visitor.yaml)|[![⭐ Stars](https://img.shields.io/github/stars/VuToV-Mykola/css-classes-from-html?style=for-the-badge)](https://github.com/VuToV-Mykola/css-classes-from-html/stargazers)|' README.de.md

echo "✅ README files updated successfully"