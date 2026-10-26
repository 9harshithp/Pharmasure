const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Transform render-blocking CSS links into asynchronous non-blocking preloads
  html = html.replace(
    /<link href="(\/static\/css\/[^"]+\.css)" rel="stylesheet">/g,
    '<link rel="preload" href="$1" as="style"><link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'"><noscript><link href="$1" rel="stylesheet"></noscript>'
  );

  fs.writeFileSync(indexPath, html);
  console.log('✅ Postbuild: Optimized index.html - all CSS is now non-render-blocking for 100 mobile score!');
} else {
  console.error('❌ build/index.html not found');
}
