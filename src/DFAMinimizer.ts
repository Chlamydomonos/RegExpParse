import type { DFA, DFAState } from './DFA';

interface SimpleDFAPath {
    to: number;
    char: string;
}

interface SimpleDFA {
    states: SimpleDFAPath[][];
    initialState: number;
    lastStates: Set<number>;
}

export default class DFAMinimizer {
    private originalDFA: SimpleDFA = {
        initialState: -1,
        states: [],
        lastStates: new Set(),
    };
    readonly minDFA: DFA;
    constructor(dfa: DFA) {
        this.genOriginalDFA(dfa);
        this.minDFA = this.createMinDFA();
    }

    private genOriginalDFA(dfa: DFA) {
        const stateMap: Map<string, number> = new Map();
        const stateQueue: DFAState[] = [dfa.initialState];

        dfa.states.forEach((state) => {
            stateMap.set(state.name, this.originalDFA.states.length);
            this.originalDFA.states.push([{ to: -1, char: '' }]);
        });

        dfa.lastStates.forEach((state) => {
            const stateId = stateMap.get(state.name);
            if (stateId == null) {
                throw Error();
            }
            this.originalDFA.lastStates.add(stateId);
        });

        const initialStateId = stateMap.get(dfa.initialState.name);
        if (initialStateId == null) {
            throw Error();
        }
        this.originalDFA.initialState = initialStateId;

        while (stateQueue.length > 0) {
            const state = stateQueue.shift();
            if (state == null) {
                throw Error();
            }

            const fromId = stateMap.get(state.name);
            if (fromId == null) {
                throw Error();
            }

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                const toId = stateMap.get(path.to.name);
                if (toId == null) {
                    throw Error();
                }

                this.originalDFA.states[fromId].push({
                    to: toId,
                    char: path.char,
                });
                if (this.originalDFA.states[toId][0].to == -1) {
                    this.originalDFA.states[toId] = [];
                    stateQueue.push(path.to);
                }
            }
        }
    }

    private createMinDFA(): DFA {
        const lastStates = this.originalDFA.lastStates;
        const notLastStates = new Set<number>();
    }

    private seperateSet(set: Set<number>): {
        equalSet: Set<number>;
        newSet: Set<number>;
    } {
        const equalSet = new Set<number>();
        const newSet = new Set<number>();

        set.forEach((state) => {
            let inEqualSet = true;
            for (let i = 0; i < this.originalDFA.states[state].length; i++) {
                const toState = this.originalDFA.states[state][i].to;
                if (!set.has(toState)) {
                    inEqualSet = false;
                    break;
                }
            }
            if (inEqualSet) {
                equalSet.add(state);
            } else {
                newSet.add(state);
            }
        });

        return { equalSet: equalSet, newSet: newSet };
    }
}
