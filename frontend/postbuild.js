const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'build', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // 1. Transform render-blocking CSS links into asynchronous non-blocking preloads
  html = html.replace(
    /<link href="(\/static\/css\/[^"]+\.css)" rel="stylesheet">/g,
    '<link rel="preload" href="$1" as="style"><link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'"><noscript><link href="$1" rel="stylesheet"></noscript>'
  );

  // 2. Extract deferred script tags from <head> and place them before </body>
  const scripts = [];
  html = html.replace(/<script[^>]*src="\/static\/js\/[^"]+"[^>]*><\/script>/g, (match) => {
    scripts.push(match);
    return '';
  });

  if (scripts.length > 0) {
    html = html.replace('</body>', `${scripts.join('')}</body>`);
    console.log(`✅ Postbuild: Moved ${scripts.length} script(s) from <head> to before </body>!`);
  }

  fs.writeFileSync(indexPath, html);
  console.log('✅ Postbuild: Optimized index.html - all CSS is now non-render-blocking and scripts placed at footer!');
} else {
  console.error('❌ build/index.html not found');
}
