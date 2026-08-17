const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("import { PandaBot }")) {
  appCode = appCode.replace(
    "import { PumpingLemmaProof } from './components/PumpingLemmaProof';",
    "import { PumpingLemmaProof } from './components/PumpingLemmaProof';\nimport { PandaBot } from './components/PandaBot';"
  );
}

if (!appCode.includes("<PandaBot")) {
  appCode = appCode.replace(
    "</main>\n        </div>\n      </div>\n    </div>",
    "</main>\n        </div>\n      </div>\n      <PandaBot transformation={transformation} isSimulating={simulationSteps.length > 0 && currentStepIndex < simulationSteps.length - 1} />\n    </div>"
  );
}

fs.writeFileSync('src/App.tsx', appCode);
