import type { NFA, NFAPath, NFAState } from './NFA';

export default class NFAFactory {
    private nfaForChar(char: string): NFA {
        const state1: NFAState = { name: '0', paths: [] };
        const state2: NFAState = { name: '1', paths: [] };
        const stateSet: Set<NFAState> = new Set();
        stateSet.add(state1);
        stateSet.add(state2);
        const path: NFAPath = {
            from: state1,
            to: state2,
            char: char,
        };

        state1.paths.push(path);
        return {
            initialState: state1,
            lastState: state2,
            states: stateSet,
        };
    }
    private nfaForCon(lNFA: NFA, rNFA: NFA): NFA {
        const path: NFAPath = {
            from: lNFA.lastState,
            to: rNFA.initialState,
            char: '',
        };

        lNFA.lastState.paths.push(path);

        return {
            initialState: lNFA.initialState,
            lastState: rNFA.lastState,
        };
    }
}
