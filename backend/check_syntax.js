const fs = require('fs'), path = require('path');
let ok = 0, errors = 0;

function checkFile(full) {
  try {
    const src = fs.readFileSync(full, 'utf8');
    new Function('require','module','exports','__dirname','__filename', src);
    process.stdout.write('✓'); ok++;
  } catch(err) {
    if (err.name === 'SyntaxError') { 
      console.error('\n❌ '+full.replace(process.cwd()+'\\', '').replace(process.cwd()+'/', '')+': '+err.message); 
      errors++; 
    } else { 
      process.stdout.write('✓'); ok++; 
    }
  }
}

function check(dir) {
  if (!fs.existsSync(dir)) return;
  if (fs.statSync(dir).isFile()) {
    if (dir.endsWith('.js')) checkFile(dir);
    return;
  }
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { check(full); return; }
    if (!e.name.endsWith('.js')) return;
    checkFile(full);
  });
}

['models','routes','middleware','server.js','seeder.js'].forEach(f => check(path.resolve(f)));
console.log('\n✅ '+ok+' files — '+errors+' syntax errors');
