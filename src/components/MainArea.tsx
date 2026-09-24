import React, { useMemo, useState, useEffect } from 'react';
import { GraphCanvas } from './GraphCanvas';
import { PumpingLemmaProof } from './PumpingLemmaProof';
import { PumpingLemmaState } from '../types';
import { Automata, ConversionStep } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MainAreaProps = {
  transformation: string;
  automata: Automata;
  simulationSteps: ConversionStep[];
  currentStepIndex: number;
  setCurrentStepIndex: (v: number) => void;
  onReset: () => void;
  plState?: PumpingLemmaState;
};

export function MainArea({
  transformation,
  automata,
  simulationSteps,
  currentStepIndex,
  setCurrentStepIndex,
  onReset,
  plState
}: MainAreaProps) {
  const [isPlaying, setIsPlaying] = useState(false);



  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < simulationSteps.length - 1) {
      intervalId = setInterval(() => {
        setCurrentStepIndex(currentStepIndex + 1);
      }, 1500 / playbackSpeed);
    } else if (currentStepIndex >= simulationSteps.length - 1) {
      setIsPlaying(false);
    }
    
    return () => clearInterval(intervalId);
  }, [isPlaying, currentStepIndex, simulationSteps.length, playbackSpeed, setCurrentStepIndex]);

  if (transformation === 'PUMPING_LEMMA' && plState) {
    return (
      <main className="flex-1 relative bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] bg-[size:32px_32px] overflow-y-auto flex flex-col">
        <PumpingLemmaProof plState={plState} isSimulating={simulationSteps.length > 0} />
      </main>
    );
  }

  const isConverting = simulationSteps.length > 0;
  const isTextSource = ['REGEX_TO_ENFA', 'REGEX_TO_DFA', 'RG_TO_FA', 'CFG_TO_PDA', 'LANG_TO_FA', 'LANG_INTERSECTION'].includes(transformation);
  const isRegexOutput = transformation === 'DFA_TO_REGEX' || transformation === 'NFA_TO_REGEX';
  
  const currentStep = isConverting ? simulationSteps[currentStepIndex] : null;

  const nfaNodes = automata.states.map(s => ({
    id: s,
    label: s,
    isStart: s === automata.startState,
    isAccept: automata.acceptStates.includes(s)
  }));
  
  const nfaEdgesGroups = new Map<string, { from: string, to: string, symbols: string[] }>();
  automata.transitions.forEach(t => {
    const key = `${t.from}->${t.to}`;
    if (!nfaEdgesGroups.has(key)) {
      nfaEdgesGroups.set(key, { from: t.from, to: t.to, symbols: [] });
    }
    const sym = t.symbol === '' ? 'ε' : t.symbol;
    if (!nfaEdgesGroups.get(key)!.symbols.includes(sym)) {
      nfaEdgesGroups.get(key)!.symbols.push(sym);
    }
  });

  const nfaHighlights = currentStep?.highlightNfaState || currentStep?.highlightDfaState || [];

  // DFA Nodes
  const dfaNodes = currentStep?.dfaStates.map(stateSet => {
    const id = stateSet.join(',');
    const label = `{${id}}`;
    
    let isAccept = false;
    if (currentStep.dfaAcceptStates) {
      isAccept = currentStep.dfaAcceptStates.some(s => s.join(',') === id);
    } else {
      isAccept = stateSet.some(s => automata.acceptStates.includes(s));
    }

    let isStart = false;
    if (currentStep.dfaStartState) {
      isStart = currentStep.dfaStartState.join(',') === id;
    } else {
      isStart = currentStep.dfaStates[0]?.join(',') === id;
    }

    return { id, label, isAccept, isStart };
  }) || [];

  const dfaEdgesGroups = new Map<string, { from: string, to: string, symbols: string[] }>();
  if (currentStep) {
    currentStep.dfaTransitions.forEach(t => {
      const key = `${t.from.join(',')}->${t.to.join(',')}`;
      if (!dfaEdgesGroups.has(key)) {
        dfaEdgesGroups.set(key, { from: t.from.join(','), to: t.to.join(','), symbols: [] });
      }
      if (!dfaEdgesGroups.get(key)!.symbols.includes(t.symbol)) {
        dfaEdgesGroups.get(key)!.symbols.push(t.symbol);
      }
    });
  }

  const highlightDfaId = currentStep?.highlightDfaState?.join(',');
  const dfaHighlights = highlightDfaId ? [highlightDfaId] : [];

  const renderTransitionTable = (isMobile: boolean = false) => {
    // get unique symbols processed so far (or all alphabet)
    let alphabet: string[] = [];
    if (isTextSource) {
      const stepAlphabet = new Set<string>();
      simulationSteps.forEach(st => {
        st.dfaTransitions.forEach(t => {
          if (t.symbol !== '' && t.symbol !== 'e' && t.symbol !== 'ε') {
            stepAlphabet.add(t.symbol);
          }
        });
      });
      alphabet = Array.from(stepAlphabet).sort();
    }
    
    if (alphabet.length === 0) {
      const alphaSet = new Set<string>();
      automata.alphabet.forEach(a => {
        const s = a.trim();
        if (s && s !== 'e' && s !== 'ε') alphaSet.add(s);
      });
      automata.transitions.forEach(t => {
        const s = (t.symbol || '').trim();
        if (s && s !== 'e' && s !== 'ε') alphaSet.add(s);
      });
      alphabet = Array.from(alphaSet).sort();
    }

    if (alphabet.length === 0) {
      alphabet = ['0', '1'];
    } else if (alphabet.length === 1 && (alphabet[0] === '0' || alphabet[0] === '1')) {
      alphabet = ['0', '1'];
    } else if (alphabet.length === 1 && (alphabet[0] === 'a' || alphabet[0] === 'b')) {
      alphabet = ['a', 'b'];
    }

    return (
      <AnimatePresence>
        {isConverting && currentStep && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`${isMobile ? 'm-0 h-auto w-full rounded-none shadow-none border-t border-border-subtle bg-bg-secondary' : 'm-6 h-56 shrink-0 bg-bg-secondary/90 backdrop-blur-md rounded-xl border border-border-subtle shadow-2xl'} flex flex-col z-10 relative`}
          >
            <div className="border-b border-border-subtle px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                Simulation Controls
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-bg-tertiary rounded-md p-0.5">
                  {[2, 4, 8].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 text-[10px] font-bold rounded ${playbackSpeed === speed ? 'bg-bg-primary shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 border border-border-subtle rounded-md p-1 bg-bg-primary">
                  <button onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0} className="p-1 text-text-muted hover:text-text-main disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={currentStepIndex === simulationSteps.length - 1 && !isPlaying} 
                    className="p-1 text-text-muted hover:text-accent-main disabled:opacity-30 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button onClick={() => setCurrentStepIndex(Math.min(simulationSteps.length - 1, currentStepIndex + 1))} disabled={currentStepIndex === simulationSteps.length - 1} className="p-1 text-text-muted hover:text-text-main disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] font-mono text-text-muted w-12 text-right">{currentStepIndex + 1} / {simulationSteps.length}</span>
              </div>
            </div>
            <div className="flex-1 p-4 grid grid-cols-3 gap-6 overflow-hidden">
              <div className="overflow-y-auto pr-2">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-text-muted border-b border-border-subtle sticky top-0 bg-bg-secondary">
                      <th className="pb-2 font-medium">State</th>
                      {alphabet.map(a => <th key={a} className="pb-2 font-medium">{a}</th>)}
                    </tr>
                  </thead>
                  <tbody className="text-text-main">
                    <AnimatePresence>
                      {currentStep.dfaStates.map(state => {
                        const stateId = state.join(',');
                        const isHighlighted = highlightDfaId === stateId;
                        return (
                          <motion.tr 
                            key={stateId} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`border-b border-border-subtle/50 transition-colors duration-300 ${isHighlighted ? 'bg-accent-main/10' : ''}`}
                          >
                            <td className="py-2 font-mono text-xs text-accent-light">{`${stateId}`}</td>
                            {alphabet.map(a => {
                              const trans = currentStep.dfaTransitions.find(t => t.from.join(',') === stateId && t.symbol === a);
                              const isCurrentTrans = isHighlighted && currentStep.currentSymbol === a;
                              return (
                                <td key={a} className={`py-2 font-mono text-xs transition-colors duration-300 ${isCurrentTrans ? 'text-accent-alt font-bold' : ''}`}>
                                  {trans ? `{${trans.to.join(',')}}` : '-'}
                                </td>
                              );
                            })}
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              <div className="col-span-2 bg-bg-primary rounded-lg p-3 border border-border-subtle font-mono text-xs overflow-y-auto flex flex-col gap-2">
                <div className="text-text-muted mb-1">// Trace Log</div>
                <div className="space-y-1">
                  <AnimatePresence>
                    {simulationSteps.slice(0, currentStepIndex + 1).map((step, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`transition-colors duration-300 ${idx === currentStepIndex ? "text-accent-light font-bold" : "text-text-muted opacity-80"}`}
                      >
                        <span className="text-accent-main">[{idx + 1}]</span> {step.message}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <main className="flex-1 relative bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] bg-[size:32px_32px] overflow-y-auto overflow-x-hidden md:overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {isConverting ? (
          <motion.div 
            key="converting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col w-full flex-1 min-h-0 relative"
          >
             <div className="flex flex-col md:flex-row w-full flex-1 min-h-0 relative">
               {!isTextSource && (
                 <div className="order-1 w-full md:w-1/2 h-[350px] md:h-full border-b md:border-b-0 md:border-r border-border-subtle relative shrink-0">
                   <div className="absolute top-4 left-4 z-10 bg-bg-tertiary px-3 py-1 rounded-md text-xs font-bold border border-border-subtle text-text-muted">Original NFA</div>
                   <GraphCanvas nodes={nfaNodes} edges={Array.from(nfaEdgesGroups.values())} highlightedNodeIds={nfaHighlights} />
                 </div>
               )}

               <div className="order-2 w-full shrink-0 md:hidden block border-b border-border-subtle">
                 {renderTransitionTable(true)}
               </div>

               <div className={`order-3 ${isTextSource ? 'w-full' : 'w-full md:w-1/2'} h-[350px] md:h-full relative shrink-0`}>
                 <div className="absolute top-4 left-4 z-10 bg-bg-tertiary px-3 py-1 rounded-md text-xs font-bold border border-border-subtle text-text-muted">
                   {isRegexOutput ? 'Generated Regular Expression' : isTextSource ? 'Generated Automaton' : 'Generated DFA'}
                 </div>
                 {isRegexOutput ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-bg-primary p-8">
                     {currentStep?.regexOutput ? (
                       <div className="text-center animate-in fade-in zoom-in duration-500">
                         <p className="text-text-muted mb-4 text-sm font-bold tracking-widest uppercase">Final Output</p>
                         <div className="text-4xl font-mono text-accent-main bg-accent-main/10 border border-accent-main/30 rounded-xl px-8 py-6 shadow-xl">
                           {currentStep.regexOutput}
                         </div>
                       </div>
                     ) : (
                       <div className="text-text-muted/50 font-mono text-sm text-center flex flex-col items-center animate-pulse">
                         <div className="w-12 h-12 rounded-full border-4 border-accent-main/30 border-t-accent-main animate-spin mb-4" />
                         <p>Eliminating states...</p>
                         <p className="text-xs mt-2 opacity-50">Applying Arden's Rule & State Elimination</p>
                       </div>
                     )}
                   </div>
                 ) : (
                   <GraphCanvas nodes={dfaNodes} edges={Array.from(dfaEdgesGroups.values())} highlightedNodeIds={dfaHighlights} />
                 )}
               </div>
             </div>

             <div className="hidden md:block">
               {renderTransitionTable(false)}
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-[500px] md:flex-1 min-h-0 relative flex items-center justify-center"
          >
            {isTextSource ? (
               <div className="text-text-muted/50 font-mono text-sm text-center">
                 <p className="mb-2">Enter your {transformation.startsWith('LANG_') ? 'language constraints' : transformation.startsWith('REGEX_') ? 'regular expression' : 'grammar'} in the sidebar</p>
                 <p>and click Convert to visualize</p>
               </div>
            ) : (
               <GraphCanvas nodes={nfaNodes} edges={Array.from(nfaEdgesGroups.values())} highlightedNodeIds={[]} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
