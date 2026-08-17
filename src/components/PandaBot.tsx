import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const PandaBot = ({ transformation, isSimulating }: { transformation: string, isSimulating: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getHelpText = () => {
    switch (transformation) {
      case 'PUMPING_LEMMA':
        return [
          "1. Select a Target Language below.",
          "2. Define the Pumping Length (p).",
          "3. Choose a string w where |w| ≥ p.",
          "4. Partition w into x, y, and z.",
          "5. Click 'Run Simulator' to check for contradictions!"
        ];
      case 'NFA_TO_DFA':
        return [
          "1. Define your NFA states, alphabet, and transitions.",
          "2. Ensure you have a start state and accept states.",
          "3. Click 'Run Simulator' to convert it step-by-step!"
        ];
      case 'DFA_MINIMIZATION':
        return [
          "1. Define your DFA.",
          "2. Click 'Run Simulator'.",
          "3. I'll use the Table Filling Method to group indistinguishable states!"
        ];
      case 'REGEX_TO_ENFA':
        return [
          "1. Enter a Regular Expression.",
          "2. Use operators like | (union) and * (star).",
          "3. Run simulator to build it using Thompson's Construction!"
        ];
      case 'DFA_TO_REGEX':
      case 'NFA_TO_REGEX':
        return [
          "1. Define your Automaton.",
          "2. Click 'Run Simulator'.",
          "3. I'll convert it to a Regex using state elimination!"
        ];
      case 'FA_EQUIVALENCE':
        return [
          "1. Define an Automaton.",
          "2. Enter a Regular Expression.",
          "3. I'll check if they accept the exact same language!"
        ];
      case 'LANG_INTERSECTION':
        return [
          "1. Define conditions for Language 1 and 2.",
          "2. I'll automatically generate the intersection DFA!"
        ];
      case 'NONE':
      default:
        return [
          "Hi! I'm your FiniteVerse guide. 🐼",
          "1. Select a mode from the top dropdown.",
          "2. Configure your inputs in the sidebar.",
          "3. Click 'Run Simulator' when ready!"
        ];
    }
  };

  const steps = getHelpText();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-bg-secondary border border-border-subtle rounded-lg shadow-xl p-4 w-72 pointer-events-auto origin-bottom-right"
          >
            <div className="flex justify-between items-center mb-3 border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐼</span>
                <span className="font-bold text-sm text-text-main">Panda Guide</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-text-muted space-y-2">
              {isSimulating ? (
                <p className="text-accent-main font-medium text-center py-2">
                  Simulation running! Watch the magic happen above. 🐼✨
                </p>
              ) : (
                <ul className="space-y-2">
                  {steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      {steps[0].startsWith("Hi!") && idx === 0 ? null : (
                        <span className="text-accent-main mt-0.5 text-[10px]">▶</span>
                      )}
                      <span className={steps[0].startsWith("Hi!") && idx === 0 ? "font-bold text-text-main mb-1 block" : ""}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-bg-secondary border border-border-subtle hover:border-accent-main rounded-full shadow-lg flex items-center justify-center text-3xl pointer-events-auto relative transition-colors"
      >
        🐼
        {!isOpen && !isSimulating && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-main opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-main"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};
