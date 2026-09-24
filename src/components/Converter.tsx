import React, { useState, useEffect } from 'react';
import { Automata, ConversionStep } from '../types';
import { convertNfaToDfa } from '../lib/automata';
import { GraphCanvas } from './GraphCanvas';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Props = {
  nfa: Automata;
  onReset: () => void;
};

export function Converter({ nfa, onReset }: Props) {
  const [steps, setSteps] = useState<ConversionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const conversionSteps = convertNfaToDfa(nfa);
    setSteps(conversionSteps);
    setCurrentStepIndex(0);
  }, [nfa]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const currentStep = steps[currentStepIndex];

  // Prepare NFA Graph data
  const nfaNodes = nfa.states.map(s => ({
    id: s,
    label: s,
    isStart: s === nfa.startState,
    isAccept: nfa.acceptStates.includes(s)
  }));
  
  const nfaEdgesGroups = new Map<string, { from: string, to: string, symbols: string[] }>();
  nfa.transitions.forEach(t => {
    const key = `${t.from}->${t.to}`;
    if (!nfaEdgesGroups.has(key)) {
      nfaEdgesGroups.set(key, { from: t.from, to: t.to, symbols: [] });
    }
    const sym = t.symbol === '' ? 'ε' : t.symbol;
    if (!nfaEdgesGroups.get(key)!.symbols.includes(sym)) {
      nfaEdgesGroups.get(key)!.symbols.push(sym);
    }
  });

  // Prepare DFA Graph data from current step
  const dfaNodes = currentStep?.dfaStates.map(stateSet => {
    const id = stateSet.join(',');
    const label = `{${id}}`;
    let isAccept = false;
    if (currentStep.dfaAcceptStates) {
      isAccept = currentStep.dfaAcceptStates.some(s => s.join(',') === id);
    } else {
      isAccept = stateSet.some(s => nfa.acceptStates.includes(s));
    }
    const isStart = currentStep.dfaStartState
      ? currentStep.dfaStartState.join(',') === id
      : currentStep.dfaStates[0]?.join(',') === id;
    
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
  
  // Highlight NFA states involved in current DFA state
  const nfaHighlights = currentStep?.highlightDfaState || [];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between bg-bg-secondary px-6 py-4 rounded-xl shadow-lg border border-border-subtle">
        <div>
          <h2 className="text-xl font-bold text-text-main">NFA to DFA Conversion</h2>
          <p className="text-sm text-text-muted">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-md bg-bg-tertiary border border-border-subtle hover:bg-bg-secondary disabled:opacity-50 transition-colors text-text-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentStepIndex === steps.length - 1}
            className="p-2 rounded-md bg-bg-tertiary border border-border-subtle hover:bg-bg-secondary disabled:opacity-50 transition-colors text-text-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-border-subtle mx-1"></div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-secondary border border-border-subtle text-text-main rounded-md transition-colors font-medium text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Edit Automata
          </button>
        </div>
      </div>

      <div className="bg-bg-tertiary border border-border-subtle rounded-xl p-4 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.p 
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-accent-main font-medium text-sm"
          >
            {currentStep?.message || 'Ready.'}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider pl-1">Original NFA</h3>
          <div className="flex-1 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] bg-[size:32px_32px] bg-bg-primary rounded-xl shadow-2xl border border-border-subtle relative overflow-hidden">
             <GraphCanvas 
               nodes={nfaNodes} 
               edges={Array.from(nfaEdgesGroups.values())} 
               highlightedNodeIds={nfaHighlights} 
               width={500} 
               height={400} 
             />
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider pl-1">Generated DFA</h3>
          <div className="flex-1 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] bg-[size:32px_32px] bg-bg-primary rounded-xl shadow-2xl border border-border-subtle relative overflow-hidden">
             {dfaNodes.length > 0 ? (
               <GraphCanvas 
                 nodes={dfaNodes} 
                 edges={Array.from(dfaEdgesGroups.values())} 
                 highlightedNodeIds={dfaHighlights} 
                 width={500} 
                 height={400} 
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-text-muted">
                 DFA graph will appear here
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
