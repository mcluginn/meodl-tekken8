const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'public');

console.log('[MEODL Build] Building static distribution in:', outDir);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy all root HTML and JSON files
for (const file of fs.readdirSync(rootDir)) {
  if (file.endsWith('.html') || file.endsWith('.json') || file === '.nojekyll' || file === 'favicon.ico') {
    const src = path.join(rootDir, file);
    const dest = path.join(outDir, file);
    fs.copyFileSync(src, dest);
    console.log(`  Copied: ${file}`);
  }
}

// 2. Copy assets directory
const srcAssets = path.join(rootDir, 'assets');
const destAssets = path.join(outDir, 'assets');
if (fs.existsSync(srcAssets)) {
  copyRecursive(srcAssets, destAssets);
  console.log('  Copied: assets/ directory (complete)');
}

console.log('✅ [MEODL Build] Complete! Files ready in public/');
