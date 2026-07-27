import fs from 'fs';

fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('manifest.json', 'dist/manifest.json');
fs.writeFileSync('dist/.assetsignore', '');
if (fs.existsSync('_worker.js')) {
  fs.copyFileSync('_worker.js', 'dist/_worker.js');
}
console.log('Dist created with _worker.js and .assetsignore successfully!');
