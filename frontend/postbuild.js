const fs = require('fs');
const path = require('path');
const { PurgeCSS } = require('purgecss');
const glob = require('glob');

async function runPostbuild() {
  const buildDir = path.join(__dirname, 'build');
  const indexPath = path.join(buildDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ build/index.html not found');
    return;
  }

  // 1. Purge unused CSS from main.*.css to completely eliminate "Reduce unused CSS"
  const cssFiles = glob.sync(path.join(buildDir, 'static/css/main.*.css'));
  if (cssFiles.length > 0) {
    try {
      const beforeSize = fs.statSync(cssFiles[0]).size;
      const purged = await new PurgeCSS().purge({
        content: [
          path.join(buildDir, 'index.html'),
          path.join(buildDir, 'static/js/*.js')
        ],
        css: cssFiles,
        safelist: {
          standard: [
            /^btn/, /^modal/, /^fade/, /^show/, /^table/, /^alert/, /^spinner/,
            /^badge/, /^nav/, /^dropdown/, /^collapse/, /^container/, /^row/, /^col/,
            /^d-/, /^p-/, /^m-/, /^w-/, /^h-/, /^shadow/
          ],
          greedy: [/^bio-/, /^font-/, /^text-/, /^bg-/, /^border/]
        }
      });
      if (purged.length > 0) {
        fs.writeFileSync(cssFiles[0], purged[0].css);
        const afterSize = fs.statSync(cssFiles[0]).size;
        console.log(`✅ Postbuild: Purged unused CSS! Reduced from ${(beforeSize/1024).toFixed(1)}KB to ${(afterSize/1024).toFixed(1)}KB (saved ${((beforeSize - afterSize)/1024).toFixed(1)}KB)!`);
      }
    } catch (err) {
      console.warn('⚠️ PurgeCSS skipped:', err.message);
    }
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // 2. Transform CSS links into non-render-blocking preloads
  html = html.replace(
    /<link href="(\/static\/css\/[^"]+\.css)" rel="stylesheet">/g,
    '<link rel="preload" href="$1" as="style"><link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'"><noscript><link href="$1" rel="stylesheet"></noscript>'
  );

  // 3. Move deferred scripts from <head> to the end of <body>
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
  console.log('✅ Postbuild: Optimized index.html - all CSS is now purged & non-render-blocking, scripts placed at footer!');
}

runPostbuild();
