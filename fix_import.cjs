const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("import { PandaBot }")) {
  appCode = appCode.replace(
    "import { Sidebar } from './components/Sidebar';",
    "import { Sidebar } from './components/Sidebar';\nimport { PandaBot } from './components/PandaBot';"
  );
  fs.writeFileSync('src/App.tsx', appCode);
}
