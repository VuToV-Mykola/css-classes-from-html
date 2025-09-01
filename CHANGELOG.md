# Changelog

All notable changes to the "CSS Classes from HTML" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2025-01-03 🎉 NEW RELEASE

### Added
- 🎨 **Configuration Management System** - Complete preset system for settings
  - Save/load configuration presets
  - Auto-save current settings
  - Export/import configurations
  - Interactive configuration dialog
  - Reset to defaults functionality
- 🚀 **2025 CSS Standards** - Full support for modern CSS properties
- ⚡ **Performance Boost** - Set/Map optimizations, caching mechanisms
- 💬 **Configurable Comments** - Customizable comment styles (`/* !!! */`, `/* TODO */`, etc.)
- 🎨 **Modern Syntax** - Container queries, subgrid, cascade layers
- 🛡️ **Enhanced Security** - Improved error handling and validation
- 📦 **VSIX Ready** - Production-ready package for marketplace
- 🔧 **New Commands** - Manage presets, export/import configuration

### Changed
- 🔄 **CSS Optimizer Rewrite** - Complete modernization following 2025 standards
- 📝 **Global Rules Enhancement** - Author-style comments for all CSS declarations
- ⚙️ **Configuration Options** - New settings for modernSyntax, preserveComments, commentStyle
- 🎯 **Performance Optimizations** - O(1) lookups using Set instead of arrays
- 💾 **Memory Management** - Cached selector-rule mapping for large files
- 🏗️ **Architecture Improvements** - Modular configuration management

### Fixed
- 🐛 **Critical CSS Bug** - Fixed missing closing brace in .sr-only rule
- 🛡️ **Security Vulnerabilities** - Fixed Log Injection and Path Traversal issues
- 🔧 **CSS Generation Issues** - Resolved property ordering and shorthand conflicts
- 📊 **Error Handling** - Comprehensive try-catch blocks with meaningful messages
- ⚡ **Performance Issues** - Eliminated redundant parseFloat operations
- 🧹 **Code Quality** - Removed unused variables and optimized loops

### Security
- 🛡️ **Log Injection Prevention** - Sanitized all user input in logging
- 🔒 **Path Traversal Protection** - Validated file paths for security
- 🚨 **Input Validation** - Enhanced validation for all user inputs
- 🔐 **Error Sanitization** - Secure error message handling

## [0.3.0] - 2024-12-19

### Added
- ✨ **CSS Optimization** - Removal of redundant declarations according to Code Guide
- 🔄 **Style Inheritance** - Automatic removal of inherited properties
- 📏 **Shorthand Optimization** - Conversion to shorthand properties
- 🧩 **Code Cleanup** - Removal of empty rules and duplicates
- ⚙️ **New Settings** - Full optimization control

### Changed
- 🎯 **Enhanced CSS Quality** - Cleaner, more maintainable output
- 📊 **Better Performance** - Optimized CSS generation algorithms

## [0.2.0] - 2024-12-19

### Added
- 🔄 **Action Repetition** - Save and repeat last actions
- 📚 **Action History** - Store history of up to 20 recent actions
- ⌨️ **New Commands** - `Ctrl+Shift+R` for repeating last action
- 🎯 **Improved Configuration** - Automatic settings persistence

### Changed
- 💾 **Auto-save Context** - Automatic saving of settings and context
- 🚀 **Workflow Enhancement** - Faster repeated operations

## [0.1.9] - 2024-12-19

### Added
- 🎯 **Universal Mechanism** - Full HTML ↔ Figma correspondence
- 📊 **Multiple Canvas Selection** - Process multiple Canvas simultaneously
- 🧠 **Intelligent Matching** - Automatic search for correspondences
- ⚙️ **Settings Configuration** - Save settings for next action

### Changed
- 🔧 **Enhanced Figma Integration** - Better token extraction and matching
- 📈 **Improved Accuracy** - More precise HTML-Figma mapping

## [0.1.6] - 2024-12-19

### Fixed
- 🔧 Fixed globalRules.getCSSReset error
- ⚙️ Added missing functions in globalRules
- 🚀 Full readiness for publication

## [0.1.5] - 2024-12-19

### Added
- ⚙️ Settings configuration for next action
- 🔄 Repeat last action without prompts
- 💾 Auto-save context and settings

### Changed
- 🎯 **Improved User Experience** - Streamlined workflow

## [0.1.4] - 2024-12-19

### Added
- 📁 Separate module for Figma cascade generation
- ⚡ Optimized HTML-based generation with cascading
- 🚫 Elimination of declaration duplication
- 🌳 Improved inheritance system

### Changed
- 🔧 **Better Code Organization** - Modular architecture
- 📊 **Enhanced Performance** - Faster CSS generation

## [0.1.0] - 2024-12-19

### Added
- 🎨 Initial release
- 🚀 Basic HTML to CSS generation
- 🔗 Figma integration
- ⚙️ VS Code extension framework
- 📝 Basic documentation

### Features
- HTML class extraction
- CSS generation with intelligent styling
- Figma token integration
- Configurable output options