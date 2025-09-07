# Security Policy

## Supported Versions

We actively support the following versions of CSS Classes from HTML with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.6   | ✅ Yes             |
| 0.0.5   | ✅ Yes             |
| 0.0.4   | ❌ No              |
| < 0.0.4 | ❌ No              |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in CSS Classes from HTML, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **vutov_nikola@icloud.com**

### What to Include

When reporting a vulnerability, please include:

1. **Description** - A clear description of the vulnerability
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Impact** - What could an attacker accomplish with this vulnerability
4. **Affected Versions** - Which versions are affected
5. **Suggested Fix** - If you have ideas for a fix (optional)

### Example Report

```
Subject: [SECURITY] Potential Path Traversal in CSS Generation

Description:
The extension may be vulnerable to path traversal attacks when processing 
user-provided file paths in the CSS generation module.

Steps to Reproduce:
1. Create HTML file with class containing "../../../"
2. Generate CSS with custom output path
3. Observe file creation outside intended directory

Impact:
An attacker could potentially write files to arbitrary locations on the 
user's system.

Affected Versions:
All versions prior to 0.0.6

Suggested Fix:
Implement path sanitization and validation before file operations.
```

### Response Timeline

- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 1 week
- **Fix Development**: Within 2 weeks (depending on complexity)
- **Release**: As soon as possible after fix is ready

### Security Measures

Our extension implements several security measures:

#### Input Validation
- All user inputs are validated and sanitized
- File paths are normalized and checked for traversal attempts
- HTML content is parsed safely without executing scripts

#### File System Security
- File operations are restricted to workspace directories
- Path traversal protection is implemented
- Temporary files are cleaned up properly

#### Figma Integration Security
- API tokens are handled securely
- Network requests use HTTPS only
- No sensitive data is logged or stored

#### Code Security
- Regular security audits with `npm audit`
- Dependencies are kept up to date
- No eval() or similar dangerous functions are used

### Security Best Practices for Users

To use the extension securely:

1. **Keep Updated** - Always use the latest version
2. **Secure Tokens** - Store Figma tokens securely in VS Code settings
3. **Workspace Trust** - Only use in trusted workspaces
4. **Review Output** - Check generated CSS before using in production
5. **Report Issues** - Report any suspicious behavior immediately

### Vulnerability Disclosure Policy

When we receive a security vulnerability report:

1. **Acknowledgment** - We'll acknowledge receipt within 48 hours
2. **Investigation** - We'll investigate and assess the vulnerability
3. **Fix Development** - We'll develop and test a fix
4. **Coordinated Disclosure** - We'll work with the reporter on disclosure timing
5. **Public Disclosure** - After the fix is released, we'll publish details

### Security Updates

Security updates are released as:
- **Patch versions** for minor security fixes
- **Minor versions** for moderate security improvements
- **Major versions** for significant security overhauls

### Hall of Fame

We recognize security researchers who help improve our security:

*No reports yet - be the first!*

### Contact

For security-related questions or concerns:
- **Email**: vutov_nikola@icloud.com
- **Subject**: [SECURITY] Your concern
- **Response Time**: Within 48 hours

### Legal

We follow responsible disclosure practices and will not pursue legal action against security researchers who:
- Report vulnerabilities in good faith
- Do not access or modify user data
- Do not disrupt our services
- Follow this security policy

Thank you for helping keep CSS Classes from HTML secure! 🔒