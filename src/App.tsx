import { useState, useEffect } from 'react';
import { Activity, Palette, Play, SquareTerminal, Github, Linkedin, X, Mail, LogOut, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { MainArea } from './components/MainArea';
import { Automata, Transition, ConversionStep, PumpingLemmaState } from './types';
import { auth, signInWithGoogle, logout, completeRedirectSignIn } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { convertNfaToDfa, convertRegexToEnfa, convertGrammarToFa, convertAutomataToRegex, convertLangToFa, convertLangIntersection, checkFaEquivalence, minimizeDfa, simulatePumpingLemma } from './lib/automata';

export default function App() {
  const [theme, setTheme] = useState('theme-gp');
  const [transformation, setTransformation] = useState('NONE');
  const [stateCount, setStateCount] = useState(1);
  const [statesList, setStatesList] = useState<{id: string, isStart: boolean, isAccept: boolean}[]>([{ id: 'q0', isStart: true, isAccept: false }]);
  const [alphabet, setAlphabet] = useState('0, 1');
  const [transitions, setTransitions] = useState<Transition[]>([{ id: 'default-1', from: 'q0', symbol: '0', to: 'q0' }]);
  const [regexInput, setRegexInput] = useState('(0|1)*011');
  const [grammarInput, setGrammarInput] = useState('S -> aS | b');
  const [langCondition, setLangCondition] = useState('starts_with');
  const [langString, setLangString] = useState('ab');
  const [langCount, setLangCount] = useState(1);
  const [langOutputType, setLangOutputType] = useState<'DFA' | 'NFA'>('DFA');
  
  const [plState, setPlState] = useState<PumpingLemmaState>({
    language: '0n1n',
    p: 0,
    w: '0000011111',
    x: 'ε',
    y: '0',
    z: '000011111',
    i: 2
  });

  const [intersectionConditions, setIntersectionConditions] = useState<{cond: string, str: string, count?: number}[]>([
    { cond: 'starts_with', str: 'ab' },
    { cond: 'ends_with', str: 'ba' }
  ]);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const [simulationSteps, setSimulationSteps] = useState<ConversionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isSimulating = simulationSteps.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    completeRedirectSignIn()
      .then((redirectUser) => {
        if (!cancelled && redirectUser) {
          setUser(redirectUser);
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        console.error(err);
        if (err?.code === 'auth/unauthorized-domain') {
          setAuthError(
            "This domain isn't authorized for sign-in yet. Add it under Firebase Console → Authentication → Settings → Authorized domains."
          );
        } else {
          setAuthError(err?.message || 'An error occurred completing sign in.');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("Cross-Origin-Opener-Policy") || err?.message?.includes("closed")) {
        setAuthError("Popup was blocked by your browser's strict privacy rules. Please try turning off Shields/Tracking Prevention or use standard Chrome.");
      } else if (err?.message?.includes("Database is closing")) {
        setAuthError("Database blocked. Are you in an Incognito window? Please use a normal window to log in.");
      } else {
        setAuthError(err.message || "An error occurred during sign in.");
      }
    }
  };

  useEffect(() => {
    document.documentElement.className = theme;
    document.body.style.backgroundColor = 'var(--bg-primary)';
    document.body.style.color = 'var(--text-main)';
  }, [theme]);

  useEffect(() => {
    if (stateCount > statesList.length) {
       const newStates = [...statesList];
       for (let i = statesList.length; i < stateCount; i++) {
          newStates.push({id: `q${i}`, isStart: i === 0 && statesList.length === 0, isAccept: false});
       }
       setStatesList(newStates);
    } else if (stateCount < statesList.length) {
       const newStates = statesList.slice(0, stateCount);
       setStatesList(newStates);
       const validStateIds = new Set(newStates.map(s => s.id));
       setTransitions(transitions.filter(t => validStateIds.has(t.from) && validStateIds.has(t.to)));
    }
  }, [stateCount]);

  const handleRunSimulator = () => {
     if (isSimulating) {
        // Stop simulation
        setSimulationSteps([]);
        return;
     }

     const automata: Automata = {
        type: transformation.includes('DFA') && !transformation.startsWith('DFA') ? 'DFA' : 'NFA',
        states: statesList.map(s => s.id),
        alphabet: alphabet.split(',').map(s => s.trim()).filter(Boolean),
        startState: statesList.find(s => s.isStart)?.id || statesList[0]?.id || '',
        acceptStates: statesList.filter(s => s.isAccept).map(s => s.id),
        transitions: transitions.filter(t => t.from && t.to && t.symbol !== undefined)
     };
     
     if (transformation === 'NFA_TO_DFA') {
         const steps = convertNfaToDfa(automata);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else if (transformation === 'DFA_TO_REGEX' || transformation === 'NFA_TO_REGEX') {
         const steps = convertAutomataToRegex(automata);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else if (transformation === 'REGEX_TO_ENFA' || transformation === 'REGEX_TO_DFA') {
         const steps = convertRegexToEnfa(regexInput);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else if (transformation === 'RG_TO_FA' || transformation === 'FA_TO_RG' || transformation === 'CFG_TO_PDA' || transformation === 'PDA_TO_CFG') {
         const steps = convertGrammarToFa(grammarInput);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);

     } else if (transformation === 'LANG_INTERSECTION') {
         const steps = convertLangIntersection(intersectionConditions, langOutputType === 'NFA');
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else if (transformation === 'DFA_MINIMIZATION') {
         const steps = minimizeDfa(automata);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else if (transformation === 'FA_EQUIVALENCE') {
         const steps = checkFaEquivalence(automata, regexInput);
         setSimulationSteps(steps);
         setCurrentStepIndex(0);
     } else {
         // Fallback mock step for unimplemented features
         setSimulationSteps([{
            type: 'done',
            message: `Conversion ${transformation} is simulated...`,
            dfaStates: [['qMock']],
            dfaTransitions: []
         }]);
         setCurrentStepIndex(0);
     }
  };

  const activeAutomata: Automata = {
    type: transformation.includes('DFA') && !transformation.startsWith('DFA') ? 'DFA' : 'NFA',
    states: statesList.map(s => s.id),
    alphabet: alphabet.split(',').map(s => s.trim()).filter(Boolean),
    startState: statesList.find(s => s.isStart)?.id || statesList[0]?.id || '',
    acceptStates: statesList.filter(s => s.isAccept).map(s => s.id),
    transitions: transitions.filter(t => t.from && t.to && t.symbol !== undefined)
  };

  if (authLoading || showSplash) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-bg-primary text-text-main ${theme}`}>
        <div className="flex flex-col items-center gap-3">
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-6xl"
          >
            🐼
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-medium text-lg text-text-muted tracking-wide text-center"
          >
            <div>Hello Guys👋🏻</div>
            <div>WELCOME🫶🏻</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center bg-bg-primary text-text-main ${theme}`}>
        <div className="text-center p-8 bg-bg-secondary rounded-xl border border-border-subtle shadow-lg max-w-md w-full mx-4">
          <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">
            🐼
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to FiniteVerse</h1>
          <p className="text-text-muted mb-8">Please sign in to access the automata simulator workspace.</p>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-accent-main text-white hover:bg-accent-hover rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            Sign In with Google
          </button>
          <p className="text-xs text-text-muted mt-4">
            By signing in you agree to our{' '}
            
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-main hover:text-accent-hover underline"
            >
              Privacy Policy
            </a>
            . We only use your Google profile to identify your saved work.
          </p>
          {authError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-left leading-relaxed">{authError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full bg-bg-primary text-text-main flex flex-col font-sans overflow-hidden ${theme}`}>
      <header className="h-16 bg-bg-secondary border-b border-border-subtle px-4 md:px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden bg-bg-tertiary text-2xl md:text-3xl">
            🐼
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight leading-tight">FiniteVerse</h1>
            <button 
              onClick={() => setShowAboutModal(true)}
              className="text-[10px] text-text-muted hover:text-accent-main text-left cursor-pointer transition-colors w-fit"
            >
              by 458TM
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:gap-2">
            <Palette className="w-5 h-5 text-text-main sm:w-4 sm:h-4 sm:text-text-muted" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 sm:opacity-100 sm:static bg-bg-tertiary sm:border sm:border-border-subtle rounded-md sm:px-3 sm:py-1.5 text-xs sm:text-sm text-text-main focus:ring-2 focus:ring-accent-main outline-none cursor-pointer"
            >
              <option value="theme-dark">Sleek Dark</option>
              <option value="theme-bw">Black &amp; White</option>
              <option value="theme-gp">Golden Pink</option>
            </select>
          </div>
          <button 
             onClick={handleRunSimulator}
             className={`px-3 md:px-6 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg ${isSimulating ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-accent-main hover:bg-accent-hover text-white shadow-accent-main/20'}`}
          >
             {isSimulating ? <SquareTerminal className="w-4 h-4" /> : <Play className="w-4 h-4" />}
             <span className="hidden sm:inline">
               {isSimulating 
                 ? 'Stop Simulation' 
                 : transformation.endsWith('_TO_REGEX')
                   ? 'Extract Expression'
                   : transformation.startsWith('REGEX_') 
                     ? 'Convert Expression'
                     : transformation === 'FA_EQUIVALENCE'
                       ? 'Check Equivalence' 
                     : transformation.includes('_TO_FA') || transformation.includes('CFG_') 
                       ? 'Convert Grammar' 
                       : 'Run Simulator'}
             </span>
          </button>
          <div className="w-px h-6 bg-border-subtle hidden md:block mx-2"></div>
          {user ? (
            <button 
              onClick={logout}
              className="px-3 sm:px-4 py-2 bg-bg-tertiary border border-border-subtle hover:bg-bg-primary rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-accent-main text-white hover:bg-accent-hover rounded-md text-sm font-medium transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        <Sidebar 
           theme={theme} setTheme={setTheme}
           transformation={transformation} setTransformation={setTransformation}
           stateCount={stateCount} setStateCount={setStateCount}
           statesList={statesList} setStatesList={setStatesList}
           transitions={transitions} setTransitions={setTransitions}
           alphabet={alphabet} setAlphabet={setAlphabet}
           isSimulating={isSimulating}
           regexInput={regexInput} setRegexInput={setRegexInput}
           grammarInput={grammarInput} setGrammarInput={setGrammarInput}
           langCondition={langCondition} setLangCondition={setLangCondition}
           langString={langString} setLangString={setLangString}
           langCount={langCount} setLangCount={setLangCount}
           intersectionConditions={intersectionConditions} setIntersectionConditions={setIntersectionConditions}
           langOutputType={langOutputType} setLangOutputType={setLangOutputType}
           plState={plState} setPlState={setPlState}
        />
        <MainArea 
           transformation={transformation}
           automata={activeAutomata}
           simulationSteps={simulationSteps}
           currentStepIndex={currentStepIndex}
           setCurrentStepIndex={setCurrentStepIndex}
           onReset={() => setSimulationSteps([])}
           plState={plState}
        />
      </div>

      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 max-w-2xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAboutModal(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🐼</span> 458TM
              </h2>
              
              <div className="space-y-6 text-sm text-text-main">
                <p className="leading-relaxed">
                  FiniteVerse is an interactive computational theory learning platform developed by team 458TM.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Profile 1 */}
                  <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-base">Aniket S. Bandgar</h3>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Designer</p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border-subtle">
                      <a href="https://github.com/AniketSB458" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-text-main text-text-muted border border-transparent hover:border-border-subtle transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="https://www.linkedin.com/in/aniket-bandgar-47800532a?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-[#0a66c2] text-text-muted border border-transparent hover:border-[#0a66c2]/30 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="mailto:anyabandgar458@gmail.com" className="p-2 bg-bg-tertiary rounded-md hover:text-accent-main text-text-muted border border-transparent hover:border-accent-main/30 transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Profile 2 */}
                  <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-base">Ayush J.Mahadik</h3>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Developer</p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border-subtle">
                      <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-text-main text-text-muted border border-transparent hover:border-border-subtle transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="https://www.linkedin.com/in/ayush-mahadik-b49b28399?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-[#0a66c2] text-text-muted border border-transparent hover:border-[#0a66c2]/30 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="mailto:ayushmahadik1256@gmail.com" className="p-2 bg-bg-tertiary rounded-md hover:text-accent-main text-text-muted border border-transparent hover:border-accent-main/30 transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Profile 3 */}
                  <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-base">Salman R.Bagwan</h3>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Developer</p>
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border-subtle">
                      <a href="https://github.com/triquetrus" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-text-main text-text-muted border border-transparent hover:border-border-subtle transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                      <a href="https://www.linkedin.com/in/salman-bagwan-885731387?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-2 bg-bg-tertiary rounded-md hover:text-[#0a66c2] text-text-muted border border-transparent hover:border-[#0a66c2]/30 transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href="mailto:salmanbagwan6002@gmail.com" className="p-2 bg-bg-tertiary rounded-md hover:text-accent-main text-text-muted border border-transparent hover:border-accent-main/30 transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
