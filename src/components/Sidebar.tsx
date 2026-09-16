import React from 'react';
import { Activity, Play, Plus, X, Trash2, Settings2, Trash } from 'lucide-react';
import { Transition } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type SidebarProps = {
  transformation: string;
  setTransformation: (v: string) => void;
  stateCount: number;
  setStateCount: (v: number) => void;
  statesList: {id: string, isStart: boolean, isAccept: boolean}[];
  setStatesList: (v: {id: string, isStart: boolean, isAccept: boolean}[]) => void;
  transitions: Transition[];
  setTransitions: (v: Transition[]) => void;
  alphabet: string;
  setAlphabet: (v: string) => void;
  isSimulating: boolean;
  regexInput: string;
  setRegexInput: (v: string) => void;
  grammarInput: string;
  setGrammarInput: (v: string) => void;
  langCondition: string;
  setLangCondition: (v: string) => void;
  langString: string;
  setLangString: (v: string) => void;
  langCount: number;
  setLangCount: (v: number) => void;
  intersectionConditions: {cond: string, str: string, count?: number}[];
  setIntersectionConditions: (v: {cond: string, str: string, count?: number}[]) => void;
  langOutputType?: 'DFA' | 'NFA';
  setLangOutputType?: (v: 'DFA' | 'NFA') => void;
  plState?: any;
  setPlState?: (st: any) => void;
  theme?: string;
  setTheme?: (v: string) => void;
};

export function Sidebar({
  transformation, setTransformation,
  stateCount, setStateCount,
  statesList, setStatesList,
  transitions, setTransitions,
  alphabet, setAlphabet,
  isSimulating,
  regexInput, setRegexInput,
  grammarInput, setGrammarInput,
  langCondition, setLangCondition,
  langString, setLangString,
  langCount, setLangCount,
  intersectionConditions, setIntersectionConditions,
  langOutputType = 'DFA', setLangOutputType,
  plState, setPlState,
  theme, setTheme
}: SidebarProps) {

  const handleStateChange = (id: string, field: 'isStart' | 'isAccept', value: boolean) => {
    setStatesList(statesList.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      if (field === 'isStart' && value) {
        // Only one start state allowed
        return { ...s, isStart: false };
      }
      return s;
    }));
  };

  const handleAddTransition = () => {
    setTransitions([...transitions, { id: Date.now().toString(), from: '', symbol: '', to: '' }]);
  };

  const handleUpdateTransition = (id: string, field: keyof Transition, value: string) => {
    setTransitions(transitions.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleRemoveTransition = (id: string) => {
    setTransitions(transitions.filter(t => t.id !== id));
  };

  const isRegexSource = transformation === 'REGEX_TO_ENFA' || transformation === 'REGEX_TO_DFA';
  const isGrammarSource = transformation === 'RG_TO_FA' || transformation === 'CFG_TO_PDA';
  const isLangSource = transformation === 'LANG_INTERSECTION' || transformation === 'LANG_TO_FA';
  const isPumpingLemma = transformation === 'PUMPING_LEMMA';
  const isAutomatonSource = !isRegexSource && !isGrammarSource && !isLangSource && !isPumpingLemma;
  const showRegexInput = isRegexSource || transformation === 'FA_EQUIVALENCE';
 
  return (
    <aside className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border-subtle bg-bg-tertiary p-4 md:p-6 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-[45vh] md:max-h-none z-10">
            <section>
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Transformation</label>
        <select 
          value={transformation}
          onChange={(e) => setTransformation(e.target.value)}
          disabled={isSimulating}
          className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
        >
          <option value="NONE">None (Visualization Only)</option>
                    <option value="LANG_INTERSECTION">Language Intersection (Product FA)</option>
          <option value="NFA_TO_DFA">NFA → DFA</option>
          <option value="DFA_MINIMIZATION">DFA Minimization</option>
          <option value="PUMPING_LEMMA">Pumping Lemma Analysis</option>
          <option value="ENFA_TO_NFA">ε-NFA → NFA</option>
          <option value="ENFA_TO_DFA">ε-NFA → DFA</option>
          <option value="DFA_TO_NFA">DFA → NFA</option>
          <option value="DFA_TO_REGEX">DFA → Regular Expression</option>
          <option value="NFA_TO_REGEX">NFA → Regular Expression</option>
          <option value="FA_EQUIVALENCE">Automaton Equivalence (Compare with Regex)</option>
          <option value="REGEX_TO_ENFA">Regular Expression → ε-NFA</option>
          <option value="REGEX_TO_DFA">Regular Expression → DFA</option>
          <option value="RG_TO_FA">Regular Grammar → Finite Automaton</option>
          
          
          
          
          
        </select>
      </section>
      
      <AnimatePresence mode="wait">
        {showRegexInput && (
          <motion.section 
            key="regex-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">{transformation === 'FA_EQUIVALENCE' ? 'Target Regular Expression' : 'Regular Expression'}</label>
            <textarea
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              disabled={isSimulating}
              placeholder="(a|b)*c"
              className="w-full h-32 bg-bg-secondary border border-border-subtle rounded p-3 text-sm text-text-main outline-none focus:border-accent-main font-mono resize-none"
            />
          </motion.section>
        )}

        {isGrammarSource && (
          <motion.section 
            key="grammar-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Grammar Productions</label>
            <textarea
              value={grammarInput}
              onChange={(e) => setGrammarInput(e.target.value)}
              disabled={isSimulating}
              placeholder="S -> aS | b"
              className="w-full h-48 bg-bg-secondary border border-border-subtle rounded p-3 text-sm text-text-main outline-none focus:border-accent-main font-mono resize-none"
            />
            <p className="text-[10px] text-text-muted mt-2">Enter one production per line.</p>
          </motion.section>
        )}

        {isLangSource && (
          <motion.section 
            key="lang-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-4"
          >
            {setLangOutputType && (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Output Type</label>
                <select
                  value={langOutputType}
                  onChange={(e) => setLangOutputType(e.target.value as 'DFA' | 'NFA')}
                  disabled={isSimulating}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
                >
                  <option value="DFA">Deterministic Finite Automaton (DFA)</option>
                  <option value="NFA">Non-Deterministic Finite Automaton (NFA)</option>
                </select>
              </div>
            )}
            {(transformation as string) === 'LANG_TO_FA' && (
              <>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Condition</label>
                  <select
                    value={langCondition}
                    onChange={(e) => setLangCondition(e.target.value)}
                    disabled={isSimulating}
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
                  >
                    <option value="none">None (Ignore condition)</option>
                    <option value="starts_with">Starts with</option>
                    <option value="ends_with">Ends with</option>
                    <option value="substring">Contains substring</option>
                    <option value="not_contain">Does not contain</option>
                    <option value="exact">Exact match</option>
                    <option value="even_count">Even count of target char</option>
                    <option value="odd_count">Odd count of target char</option>
                    <option value="exact_count">Exactly N occurrences</option>
                    <option value="length_div_by">Length divisible by N</option>
                    <option value="binary_div_by">Binary value divisible by N</option>
                  </select>
                </div>
                {langCondition === 'exact_count' && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Number of Occurrences (N)</label>
                    <input
                      type="number"
                      min="0"
                      value={langCount}
                      onChange={(e) => setLangCount(parseInt(e.target.value) || 0)}
                      disabled={isSimulating}
                      className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono mb-3"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Target Character / Sequence</label>
                  <input
                    type="text"
                    value={langString}
                    onChange={(e) => setLangString(e.target.value)}
                    disabled={isSimulating}
                    placeholder="e.g. ab"
                    className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
                  />
                </div>
              </>
            )}
            
            {transformation === 'LANG_INTERSECTION' && (
              <div className="pt-4 border-t border-border-subtle mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">Intersection Rules</h3>
                  <button 
                    onClick={() => setIntersectionConditions([...intersectionConditions, {cond: 'starts_with', str: ''}])} 
                    disabled={isSimulating} 
                    className="p-1 rounded bg-bg-tertiary hover:bg-border-subtle transition-colors text-text-main disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {intersectionConditions.map((condition, index) => (
                    <div key={index} className="p-3 bg-bg-tertiary/50 border border-border-subtle rounded space-y-3 relative">
                      {intersectionConditions.length > 2 && (
                        <button 
                          onClick={() => setIntersectionConditions(intersectionConditions.filter((_, i) => i !== index))} 
                          className="absolute top-2 right-2 text-text-muted hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-2">Condition {index + 1}</label>
                        <select
                          value={condition.cond}
                          onChange={(e) => {
                            const newConds = [...intersectionConditions];
                            newConds[index].cond = e.target.value;
                            setIntersectionConditions(newConds);
                          }}
                          disabled={isSimulating}
                          className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
                        >
                          <option value="none">None (Ignore condition)</option>
                    <option value="starts_with">Starts with</option>
                          <option value="ends_with">Ends with</option>
                          <option value="substring">Contains substring</option>
                          <option value="not_contain">Does not contain</option>
                          <option value="exact">Exact match</option>
                          <option value="even_count">Even count of target char</option>
                          <option value="odd_count">Odd count of target char</option>
                          <option value="exact_count">Exactly N occurrences</option>
                          <option value="length_div_by">Length divisible by N</option>
                          <option value="binary_div_by">Binary value divisible by N</option>
                        </select>
                      </div>
                      {condition.cond === 'exact_count' && (
                        <div>
                          <input
                            type="number"
                            min="0"
                            value={condition.count ?? 1}
                            onChange={(e) => {
                              const newConds = [...intersectionConditions];
                              newConds[index].count = parseInt(e.target.value) || 0;
                              setIntersectionConditions(newConds);
                            }}
                            disabled={isSimulating}
                            placeholder="Count N"
                            className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono mb-2"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="text"
                          value={condition.str}
                          onChange={(e) => {
                            const newConds = [...intersectionConditions];
                            newConds[index].str = e.target.value;
                            setIntersectionConditions(newConds);
                          }}
                          disabled={isSimulating}
                          placeholder="Sequence"
                          className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        
        {isPumpingLemma && (
          <motion.div
            key="pl-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Target Language</label>
              <select 
                value={plState.language} 
                onChange={e => setPlState({...plState, language: e.target.value})}
                disabled={isSimulating}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
              >
                <option value="anbn">L = aⁿbⁿ</option>
                <option value="0n1n">L = 0ⁿ1ⁿ</option>
                <option value="anbncn">L = aⁿbⁿcⁿ</option>
                <option value="0n1n2n">L = 0ⁿ1ⁿ2ⁿ</option>
                <option value="0n1n0n">L = 0ⁿ1ⁿ0ⁿ</option>
                <option value="wwR">L = wwᴿ (Palindromes over a,b)</option>
                <option value="wwR_01">L = wwᴿ (Palindromes over 0,1)</option>
                <option value="ww">L = ww (Copy language)</option>
                <option value="prime">L = aᵖ (p is prime)</option>
                <option value="prime_0">L = 0ᵖ (p is prime)</option>
                <option value="anbm_neq">L = aⁿbᵐ (n ≠ m)</option>
                <option value="eq_01">L = {'{w | #0(w) = #1(w)}'}</option>
              </select>
            </section>

            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Pumping Length (p)</label>
              <input 
                type="number"
                min="0"
                value={plState.p}
                onChange={e => setPlState({...plState, p: e.target.value === '' ? '' : (parseInt(e.target.value) ?? 0)})}
                disabled={isSimulating}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
              />
            </section>

            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">String (w ∈ L, |w| ≥ p)</label>
              <input 
                type="text"
                value={plState.w}
                onChange={e => setPlState({...plState, w: e.target.value})}
                disabled={isSimulating}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
              />
            </section>

            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Partition (w = xyz)</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text"
                  placeholder="x"
                  value={plState.x}
                  onChange={e => setPlState({...plState, x: e.target.value})}
                  disabled={isSimulating}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
                />
                <input 
                  type="text"
                  placeholder="y (|y| > 0, |xy| ≤ p)"
                  value={plState.y}
                  onChange={e => setPlState({...plState, y: e.target.value})}
                  disabled={isSimulating}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
                />
                <input 
                  type="text"
                  placeholder="z"
                  value={plState.z}
                  onChange={e => setPlState({...plState, z: e.target.value})}
                  disabled={isSimulating}
                  className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
                />
              </div>
            </section>

            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Pump (i)</label>
              <input 
                type="number"
                min="0"
                value={plState.i}
                onChange={e => setPlState({...plState, i: e.target.value === '' ? '' : (parseInt(e.target.value) ?? 0)})}
                disabled={isSimulating}
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main font-mono"
              />
            </section>
          </motion.div>
        )}

        {isAutomatonSource && (
          <motion.div 
            key="automaton-input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8 flex-1"
          >
            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">Alphabet</label>
              <input 
                type="text" 
                value={alphabet}
                onChange={(e) => setAlphabet(e.target.value)}
                disabled={isSimulating}
                placeholder="e.g. 0, 1"
                className="w-full bg-bg-secondary border border-border-subtle rounded p-2 text-sm text-text-main outline-none focus:border-accent-main"
              />
            </section>

            <section>
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-3">States Configuration</label>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-text-main">Count:</span>
                <input 
                  type="number" 
                  min="0"
                  max="15"
                  value={stateCount === 0 ? '' : stateCount}
                  onChange={(e) => setStateCount(e.target.value === '' ? 0 : parseInt(e.target.value))}
                  disabled={isSimulating}
                  placeholder="0"
                  className="w-16 bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-sm text-accent-light outline-none"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 overflow-x-hidden">
                <AnimatePresence>
                  {statesList.map(s => (
                    <motion.div 
                      layout
                      key={s.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between text-xs bg-bg-secondary/50 p-2 rounded border border-border-subtle"
                    >
                      <span className="font-mono text-text-main">{s.id}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-text-muted cursor-pointer">
                          <input type="checkbox" checked={s.isStart} disabled={isSimulating} onChange={(e) => handleStateChange(s.id, 'isStart', e.target.checked)} className="accent-accent-main" /> Init
                        </label>
                        <label className="flex items-center gap-1 text-text-muted cursor-pointer">
                          <input type="checkbox" checked={s.isAccept} disabled={isSimulating} onChange={(e) => handleStateChange(s.id, 'isAccept', e.target.checked)} className="accent-accent-main" /> Acc
                        </label>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            <section className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted block">Transitions</label>
                 <button onClick={handleAddTransition} disabled={isSimulating} className="text-accent-light hover:text-accent-main disabled:opacity-50">
                   <Plus className="w-4 h-4" />
                 </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 overflow-x-hidden">
                <AnimatePresence>
                  {transitions.map((t) => (
                    <motion.div 
                      layout
                      key={t.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-1"
                    >
                      <select 
                        value={t.from}
                        onChange={e => handleUpdateTransition(t.id, 'from', e.target.value)}
                        disabled={isSimulating}
                        className="w-1/3 bg-bg-secondary border border-border-subtle rounded px-1 py-1 text-xs text-text-main outline-none focus:border-accent-main font-mono"
                      >
                        <option value="" disabled>from</option>
                        {statesList.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                      </select>
                      <span className="text-text-muted text-xs">-</span>
                      <input 
                        type="text" 
                        value={t.symbol}
                        onChange={e => handleUpdateTransition(t.id, 'symbol', e.target.value)}
                        disabled={isSimulating}
                        className="w-1/4 bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-xs text-text-main outline-none focus:border-accent-main font-mono text-center"
                        placeholder="sym"
                      />
                      <span className="text-text-muted text-xs">→</span>
                      <select 
                        value={t.to}
                        onChange={e => handleUpdateTransition(t.id, 'to', e.target.value)}
                        disabled={isSimulating}
                        className="w-1/3 bg-bg-secondary border border-border-subtle rounded px-1 py-1 text-xs text-text-main outline-none focus:border-accent-main font-mono"
                      >
                        <option value="" disabled>to</option>
                        {statesList.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                      </select>
                      <button onClick={() => handleRemoveTransition(t.id)} disabled={isSimulating} className="text-text-muted hover:text-red-400 p-1 disabled:opacity-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-4 border-t border-border-subtle">
        <div className="text-[10px] text-text-muted uppercase tracking-tighter">Current Status</div>
        <div className="text-xs text-accent-alt mt-1 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent-alt rounded-full"></span> 
          {isSimulating ? "Simulation Active" : "Configuration Mode"}
        </div>
      </div>
    </aside>
  );
}
