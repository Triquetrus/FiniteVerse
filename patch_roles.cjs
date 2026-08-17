const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Aniket
appCode = appCode.replace(
  '<h3 className="font-bold text-base">Aniket S. Bandgar</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Designer</p>',
  '<h3 className="font-bold text-base">Aniket S. Bandgar</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Developer</p>'
);

// Replace Ayush
appCode = appCode.replace(
  '<h3 className="font-bold text-base">Ayush J.Mahadik</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Developer</p>',
  '<h3 className="font-bold text-base">Ayush J.Mahadik</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Designer</p>'
);

// Replace Salman
appCode = appCode.replace(
  '<h3 className="font-bold text-base">Salman R.Bagwan</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Developer</p>',
  '<h3 className="font-bold text-base">Salman R.Bagwan</h3>\n                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Designer</p>'
);

fs.writeFileSync('src/App.tsx', appCode);
