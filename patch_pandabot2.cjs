const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes("import { PandaBot }")) {
  appCode = appCode.replace(
    "import { PumpingLemmaProof } from './components/PumpingLemmaProof';",
    "import { PumpingLemmaProof } from './components/PumpingLemmaProof';\nimport { PandaBot } from './components/PandaBot';"
  );
}

const botTag = "<PandaBot transformation={transformation} isSimulating={simulationSteps.length > 0 && currentStepIndex < simulationSteps.length - 1} />";

if (!appCode.includes(botTag)) {
  appCode = appCode.replace(
    "      </AnimatePresence>\n    </div>",
    "      </AnimatePresence>\n      " + botTag + "\n    </div>"
  );
}

fs.writeFileSync('src/App.tsx', appCode);
