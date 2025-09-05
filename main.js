#!/usr/bin/env node
/* main.js — CLI інтегратор Figma → HTML/CSS
   Підтримує фільтрацію по selectedCanvases / selectedLayers
*/
require('dotenv').config();
const FigmaAPIClient = require('./core/FigmaAPIClient');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node main.js <FIGMA_KEY|FIGMA_LINK> <HTML_PATH> [--canvases=id1,id2] [--layers=idA,idB]');
    process.exit(1);
  }
  const fileKeyOrLink = args[0];
  const htmlPath = args[1];
  const fileKeyMatch = fileKeyOrLink.match(/file\/([a-zA-Z0-9_-]+)/);
  const fileKey = fileKeyMatch ? fileKeyMatch[1] : fileKeyOrLink;

  const opts = {};
  args.slice(2).forEach(a=>{
    if (a.startsWith('--canvases=')) opts.canvases = a.split('=')[1].split(',').filter(Boolean);
    if (a.startsWith('--layers=')) opts.layers = a.split('=')[1].split(',').filter(Boolean);
  });

  const token = process.env.FIGMA_API_TOKEN;
  if (!token) console.warn('⚠️ FIGMA_API_TOKEN not set — Figma integration may fail');

  const client = new FigmaAPIClient(token);
  try {
    const file = await client.fetchFile(fileKey);
    console.log('Loaded Figma file:', file.name);
    // If canvases selected, filter children
    let targetNodes = [];
    const pages = (file.document && file.document.children) || [];
    if (opts.canvases && opts.canvases.length>0) {
      pages.forEach(p=>{
        if (opts.canvases.includes(p.id)) {
          targetNodes.push(...(p.children||[]));
        }
      });
    } else {
      // default: take all children from all pages
      pages.forEach(p=> targetNodes.push(...(p.children||[])));
    }

    // If layers filter present — filter targetNodes by id
    if (opts.layers && opts.layers.length>0) {
      targetNodes = targetNodes.filter(n => opts.layers.includes(n.id));
    }

    // For demo: print summary and create basic CSS output
    console.log(`Found ${targetNodes.length} target layers for CSS mapping`);
    const html = await fs.readFile(htmlPath, 'utf8');
    // Простий генератор — створює CSS placeholder для кожного .class у html
    const matches = html.match(/class\s*=\s*"(.*?)"/g) || [];
    const classes = new Set();
    matches.forEach(m=>{
      const inner = m.replace(/class\s*=\s*"/,'').replace(/"$/,'');
      inner.split(/\s+/).forEach(c=>classes.add(c));
    });
    let css = '/* Generated CSS */\n';
    classes.forEach(c=>{
      css += `.${c} {\n  /* mapped to figma layers: TBD */\n}\n\n`;
    });
    const outDir = path.join(process.cwd(),'output');
    await fs.mkdir(outDir,{recursive:true});
    const cssPath = path.join(outDir,'styles.css');
    await fs.writeFile(cssPath, css,'utf8');
    console.log('CSS written to', cssPath);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

if (require.main === module) run();
module.exports = { run };
