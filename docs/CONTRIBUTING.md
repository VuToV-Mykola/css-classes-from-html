# Contributing to CSS Classes from HTML

🎉 Thank you for your interest in contributing to CSS Classes from HTML! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- VS Code 1.74.0 or higher
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/css-classes-from-html.git
   cd css-classes-from-html
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Open in VS Code**
   ```bash
   code .
   ```

4. **Run Extension**
   - Press `F5` to open Extension Development Host
   - Test your changes in the new VS Code window

## 🛠️ Development Workflow

### Project Structure
```
css-classes-from-html/
├── modules/                 # Core functionality modules
│   ├── cssGenerator.js     # CSS generation logic
│   ├── figmaService.js     # Figma API integration
│   ├── htmlParser.js       # HTML parsing utilities
│   └── ...
├── config/                 # Configuration files
├── test/                   # Test files
├── extension.js            # Main extension entry point
└── package.json           # Extension manifest
```

### Available Scripts

```bash
# Lint code
npm run lint

# Run tests
npm test

# Build VSIX package
npm run build

# Package for distribution
npm run package
```

## 📝 Contributing Guidelines

### Code Style

- Use ES6+ features
- Follow existing code formatting
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

### Commit Messages

Use conventional commit format:
```
type(scope): description

feat(css): add support for CSS Grid
fix(figma): resolve token extraction issue
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

## 🐛 Issue Reporting

### Before Creating an Issue

1. Check existing issues and discussions
2. Read the documentation
3. Try the latest version
4. Provide minimal reproduction case

### Issue Templates

Use the provided issue templates:
- **Bug Report** - For reporting bugs
- **Feature Request** - For suggesting new features
- **Question** - For asking questions

### Required Information

**For Bug Reports:**
- VS Code version
- Extension version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Sample code (if applicable)

**For Feature Requests:**
- Clear description of the feature
- Use cases and benefits
- Examples or mockups
- Priority level

## 🔄 Pull Request Process

### Before Submitting

1. **Create an Issue** - Discuss your changes first
2. **Fork the Repository** - Work on your own fork
3. **Create a Branch** - Use descriptive branch names
4. **Make Changes** - Follow coding guidelines
5. **Test Thoroughly** - Ensure all tests pass
6. **Update Documentation** - If needed

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings introduced

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "CSS Generator"

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place tests in `test/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

Example:
```javascript
describe('CSS Generator', () => {
  it('should generate CSS from HTML classes', () => {
    const html = '<div class="container">Content</div>';
    const result = generateCSS(html);
    expect(result).toContain('.container');
  });
});
```

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and descriptions
- Provide usage examples

```javascript
/**
 * Generates CSS from HTML content
 * @param {string} htmlContent - The HTML content to parse
 * @param {Object} options - Generation options
 * @param {boolean} options.minify - Whether to minify output
 * @returns {string} Generated CSS content
 * @example
 * const css = generateCSS('<div class="btn">Click</div>', { minify: true });
 */
function generateCSS(htmlContent, options = {}) {
  // Implementation
}
```

### README Updates

When adding new features:
- Update feature list
- Add usage examples
- Update screenshots if needed
- Update configuration options

## 🎯 Areas for Contribution

### High Priority
- Performance optimizations
- Bug fixes
- Test coverage improvements
- Documentation enhancements

### Medium Priority
- New CSS generation features
- Figma integration improvements
- UI/UX enhancements
- Code refactoring

### Low Priority
- Additional language support
- Advanced configuration options
- Integration with other tools

## 🤝 Community

### Getting Help

- **GitHub Discussions** - Ask questions and share ideas
- **Issues** - Report bugs and request features
- **Email** - vutov_nikola@icloud.com for private matters

### Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in CHANGELOG.md

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, is valuable and appreciated. Thank you for helping make CSS Classes from HTML better!

---

**Happy Contributing! 🚀**