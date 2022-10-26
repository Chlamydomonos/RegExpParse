import { DFAState, type DFA } from './DFA';

interface SimpleDFAPath {
    to: number;
    char: string;
}

interface SimpleDFA {
    states: SimpleDFAPath[][];
    initialState: number;
    finalStates: Set<number>;
}

export default class DFAMinimizer {
    private originalDFA: SimpleDFA = {
        initialState: -1,
        states: [],
        finalStates: new Set(),
    };
    private charSetSize = 0;
    readonly minDFA: DFA;
    constructor(dfa: DFA) {
        this.genOriginalDFA(dfa);

        for (let i = 0; i < this.originalDFA.states.length; i++) {
            const state = this.originalDFA.states[i];
            if (state.length > this.charSetSize) {
                this.charSetSize = state.length;
            }
        }

        this.minDFA = this.createMinDFA();
    }

    private genOriginalDFA(dfa: DFA) {
        const stateMap = new Map<string, number>();
        const stateQueue: DFAState[] = [dfa.initialState];

        dfa.states.forEach((state) => {
            stateMap.set(state.name, this.originalDFA.states.length);
            this.originalDFA.states.push([{ to: -1, char: '' }]);
        });

        dfa.finalStates.forEach((state) => {
            const stateId = stateMap.get(state.name);
            if (stateId == null) {
                throw Error();
            }
            this.originalDFA.finalStates.add(stateId);
        });

        const initialStateId = stateMap.get(dfa.initialState.name);
        if (initialStateId == null) {
            throw Error();
        }
        this.originalDFA.initialState = initialStateId;
        this.originalDFA.states[initialStateId] = [];

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
                const to = this.originalDFA.states[toId][0];
                if (to != null && to.to == -1) {
                    this.originalDFA.states[toId] = [];
                    stateQueue.push(path.to);
                }
            }
        }
    }

    private createMinDFA(): DFA {
        const livingFinalStates = new Set<number>();
        const deadFinalStates = new Set<number>();
        const livingNotFinalStates = new Set<number>();
        const deadNotFinalStates = new Set<number>();
        for (let i = 0; i < this.originalDFA.states.length; i++) {
            const state = this.originalDFA.states[i];
            if (this.originalDFA.finalStates.has(i)) {
                if (state.length == this.charSetSize) {
                    livingFinalStates.add(i);
                } else {
                    deadFinalStates.add(i);
                }
            } else {
                if (state.length == this.charSetSize) {
                    livingNotFinalStates.add(i);
                } else {
                    deadNotFinalStates.add(i);
                }
            }
        }

        const setQueue: Set<number>[] = [
            livingFinalStates,
            livingNotFinalStates,
            deadFinalStates,
            deadNotFinalStates,
        ];
        const minSets: Set<number>[] = [];
        while (setQueue.length > 0) {
            const set = setQueue.shift();
            if (set == null) {
                throw Error();
            }

            const result = this.separateSet(set);
            if (result.newSet.size == 0) {
                minSets.push(result.equalSet);
            } else {
                setQueue.push(result.equalSet, result.newSet);
            }
        }

        const stateMap: number[] = [];
        const simpleMin: Map<string, number>[] = [];
        for (let i = 0; i < this.originalDFA.states.length; i++) {
            stateMap.push(-1);
            simpleMin.push(new Map());
        }

        for (let i = 0; i < minSets.length; i++) {
            const set = minSets[i];
            const target = [...set][0];
            set.forEach((state) => {
                stateMap[state] = target;
            });
        }

        for (let i = 0; i < this.originalDFA.states.length; i++) {
            for (let j = 0; j < this.originalDFA.states[i].length; j++) {
                const char = this.originalDFA.states[i][j].char;
                const from = stateMap[i];
                const to = stateMap[this.originalDFA.states[i][j].to];
                simpleMin[from].set(char, to);
            }
        }

        let outInitialState = new DFAState();
        const outFinalStates = new Set<DFAState>();
        const outStates = new Set<DFAState>();
        const outStateMap = new Map<number, DFAState>();

        let stateName = 0;

        for (let i = 0; i < simpleMin.length; i++) {
            if (simpleMin[i].size == 0) {
                continue;
            }

            const state: DFAState = {
                name: (++stateName).toString(),
                paths: [],
            };

            outStates.add(state);
            outStateMap.set(i, state);
            if (this.originalDFA.finalStates.has(i)) {
                outFinalStates.add(state);
            }
            if (i == stateMap[this.originalDFA.initialState]) {
                outInitialState = state;
            }
        }

        for (let i = 0; i < simpleMin.length; i++) {
            simpleMin[i].forEach((value, key) => {
                const from = outStateMap.get(i);
                const to = outStateMap.get(value);
                if (from == null || to == null) {
                    throw Error();
                }

                from.paths.push({
                    to: to,
                    char: key,
                });
            });
        }

        return {
            initialState: outInitialState,
            finalStates: outFinalStates,
            states: outStates,
        };
    }

    private separateSet(set: Set<number>): {
        equalSet: Set<number>;
        newSet: Set<number>;
    } {
        if (set.size < 2) {
            return { equalSet: set, newSet: new Set() };
        }

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
