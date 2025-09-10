# 📦 VS Code Marketplace Upload Instructions

## Upload to VS Code Marketplace

1. **Login to Marketplace:**
   - Go to: https://marketplace.visualstudio.com/manage
   - Login with Microsoft account

2. **Upload VSIX:**
   - Click "New extension"
   - Upload file: `css-classes-from-html-0.0.7.vsix`

3. **Verify Extension:**
   - Check extension page
   - Test installation

## Alternative: Command Line Upload

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Login to marketplace (requires Personal Access Token)
vsce login vutov-mykola

# Publish directly
vsce publish
```

## Package Information
- **Version:** 0.0.7
- **Package:** css-classes-from-html-0.0.7.vsix
- **Size:** 2.3M
