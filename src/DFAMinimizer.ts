import type { DFA, DFAState } from './DFA';

export default class DFAMinimizer {
    private originalStateSet: Set<string>;
    private originalPathSet: Map<string, string[]>;
    readonly minDFA: DFA;
    constructor(dfa: DFA) {}
}
