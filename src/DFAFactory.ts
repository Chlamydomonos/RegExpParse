import type { DFA, DFAPath, DFAState } from './DFA';
import type { NFA, NFAState } from './NFA';

type NFAStateMap = Map<string, NFAState>;

export default class DFAFactory {
    private nfaStateMap: NFAStateMap;
    readonly dfa: DFA;
    constructor(nfa: NFA) {
        this.nfaStateMap = this.genNFAStateMap(nfa);
        this.dfa = this.createDFA(nfa);
    }
    private createDFA(nfa: NFA): DFA {
        const dfaStateSet: Set<string> = new Set();
        const dfaLastStateSet: Set<string> = new Set();
        const dfaPathSet: Set<string> = new Set();

        const stateSetQueue: Set<string>[] = [];

        const initialStateSet = this.epsilonClosure(
            new Set([nfa.initialState.name])
        );
        stateSetQueue.push(initialStateSet);
        dfaStateSet.add(this.genSetName(initialStateSet));

        while (stateSetQueue.length > 0) {
            const stateSet = stateSetQueue.shift();
            if (stateSet == null) {
                throw Error();
            }

            const stateName = this.genSetName(stateSet);
            dfaStateSet.add(stateName);
            if (stateSet.has(nfa.lastState.name)) {
                dfaLastStateSet.add(stateName);
            }

            const charSet = this.availableChars(stateSet);
            charSet.forEach((char) => {
                const newStateSet = this.to(stateSet, char);
                const newStateName = this.genSetName(newStateSet);
                dfaPathSet.add(`${stateName}|${newStateName}|${char}`);
                if (!dfaStateSet.has(newStateName)) {
                    stateSetQueue.push(newStateSet);
                }
            });
        }

        const dfaStateMap: Map<string, DFAState> = new Map();
        dfaStateSet.forEach((stateName) => {
            dfaStateMap.set(stateName, {
                name: stateName,
                paths: [],
            });
        });

        dfaPathSet.forEach((pathStr) => {
            const temp = pathStr.split('|');
            const fromStateName = temp[0];
            const toStateName = temp[1];
            const char = temp[2];
            const fromState = dfaStateMap.get(fromStateName);
            const toState = dfaStateMap.get(toStateName);
            if (fromState == null || toState == null) {
                throw Error();
            }
            this.connect(fromState, toState, char);
        });

        const lastStates: Set<DFAState> = new Set();
        dfaLastStateSet.forEach((stateName) => {
            const state = dfaStateMap.get(stateName);
            if (state == null) {
                throw Error();
            }
            lastStates.add(state);
        });

        const initialState = dfaStateMap.get(this.genSetName(initialStateSet));

        if (initialState == null) {
            throw Error();
        }

        return {
            initialState: initialState,
            lastStates: lastStates,
            states: new Set(dfaStateMap.values()),
        };
    }

    private connect(from: DFAState, to: DFAState, char: string): void {
        const path: DFAPath = {
            from: from,
            to: to,
            char: char,
        };

        from.paths.push(path);
    }

    private genNFAStateMap(nfa: NFA): NFAStateMap {
        const out: NFAStateMap = new Map();
        nfa.states.forEach((value) => {
            out.set(value.name, value);
        });
        return out;
    }

    private epsilonClosure(stateNames: Set<string>): Set<string> {
        const out: Set<string> = new Set();
        const stateQueue = [...stateNames];
        while (stateQueue.length > 0) {
            const value = stateQueue.shift();
            if (value == null) {
                throw Error();
            }
            out.add(value);
            const state = this.nfaStateMap.get(value);
            if (state == null) {
                throw Error();
            }

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                if (path.char == '' && !out.has(path.to.name)) {
                    stateQueue.push(path.to.name);
                }
            }
        }
        return out;
    }

    private to(stateNames: Set<string>, char: string): Set<string> {
        const out: Set<string> = new Set();
        stateNames.forEach((value) => {
            const state = this.nfaStateMap.get(value);
            if (state == null) {
                throw Error();
            }

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                if (path.char == char) {
                    out.add(path.to.name);
                }
            }
        });

        return this.epsilonClosure(out);
    }

    private genSetName(set: Set<string>): string {
        const setSorted = [...set].sort((a, b) => parseInt(a) - parseInt(b));
        let out = '{';
        for (let i = 0; i < setSorted.length - 1; i++) {
            out += `${setSorted[i]}, `;
        }
        out += `${setSorted[setSorted.length - 1]}}`;
        return out;
    }

    private availableChars(stateNames: Set<string>): Set<string> {
        const out: Set<string> = new Set();

        stateNames.forEach((value) => {
            const state = this.nfaStateMap.get(value);
            if (state == null) {
                throw Error();
            }

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                if (path.char != '') {
                    out.add(path.char);
                }
            }
        });

        return out;
    }
}
