import { DFAState, type DFA, type DFAPath } from './DFA';

interface SimpleDFA {
    states: number[][];
    initialState: number;
    finalStates: Set<number>;
}

class StateSet {
    constructor(public id: number, public value: number[] = []) {}
}

export default class DFAMinimizer {
    private maxStateSetId = 0;
    private allStateSets = new Map<number, StateSet>();
    private stateSetMap: StateSet[] = [];
    private originalDFA: SimpleDFA;
    private charSet: string[] = [];
    private charSetReversed = new Map<string, number>();
    readonly minDFA: DFA;

    constructor(dfa: DFA) {
        this.initCharSet(dfa);

        this.originalDFA = {
            states: [],
            initialState: -1,
            finalStates: new Set(),
        };
        this.initDFA(dfa);
        this.minDFA = this.minimizeDFA();
    }

    private newStateSet(value?: number[]): StateSet {
        let out: StateSet;
        if (value == null) {
            out = new StateSet(++this.maxStateSetId);
        } else {
            out = new StateSet(++this.maxStateSetId, value);
        }

        this.allStateSets.set(out.id, out);

        value?.forEach((state) => {
            this.stateSetMap[state] = out;
        });

        return out;
    }

    private separateStateSet(set: StateSet): StateSet[] {
        if (set.value.length == 0) {
            this.allStateSets.delete(set.id);
            return [];
        }

        if (set.value.length == 1) {
            return [set];
        }

        const toMap = new Map<string, number[]>();

        set.value.forEach((state) => {
            const to = this.genTo(state);
            if (toMap.has(to)) {
                toMap.get(to)?.push(state);
            } else {
                toMap.set(to, [state]);
            }
        });

        const out: StateSet[] = [];

        toMap.forEach((value) => {
            out.push(this.newStateSet(value));
        });

        return out;
    }

    private genTo(state: number): string {
        let out = '';
        for (let i = 0; i < this.charSet.length; i++) {
            const to = this.originalDFA.states[state][i];
            if (to < 0) {
                out += 'e,';
            } else {
                out += `${this.stateSetMap[to].id},`;
            }
        }
        return out;
    }

    private initCharSet(dfa: DFA) {
        const tempCharSet = new Set<string>();
        dfa.states.forEach((state) => {
            for (let i = 0; i < state.paths.length; i++) {
                tempCharSet.add(state.paths[i].char);
            }
        });
        this.charSet = [...tempCharSet];
        for (let i = 0; i < this.charSet.length; i++) {
            this.charSetReversed.set(this.charSet[i], i);
        }
    }

    private initDFA(dfa: DFA) {
        const tempStateMap = new Map<string, number>();
        dfa.states.forEach((state) => {
            const id = this.originalDFA.states.length;
            tempStateMap.set(state.name, id);
            const tempArray = [];
            for (let i = 0; i < this.charSet.length; i++) {
                tempArray.push(-1);
            }
            this.originalDFA.states.push(tempArray);
        });

        const initialStateId = tempStateMap.get(dfa.initialState.name);
        if (initialStateId == null) {
            throw Error();
        }

        this.originalDFA.initialState = initialStateId;

        dfa.finalStates.forEach((state) => {
            const id = tempStateMap.get(state.name);
            if (id == null) {
                throw Error();
            }
            this.originalDFA.finalStates.add(id);
        });

        dfa.states.forEach((state) => {
            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                const fromId = tempStateMap.get(state.name);
                const toId = tempStateMap.get(path.to.name);
                const charId = this.charSetReversed.get(path.char);
                if (fromId == null || toId == null || charId == null) {
                    throw Error();
                }
                this.originalDFA.states[fromId][charId] = toId;
            }
        });
    }

    private minimizeDFA(): DFA {
        const livingFinal: number[] = [];
        const livingNotFinal: number[] = [];
        const deadFinal: number[] = [];
        const deadNotFinal: number[] = [];
        for (let i = 0; i < this.originalDFA.states.length; i++) {
            const state = this.originalDFA.states[i];
            let isLiving = true;
            for (let j = 0; j < state.length; j++) {
                if (state[j] < 0) {
                    isLiving = false;
                    break;
                }
            }
            if (isLiving) {
                if (this.originalDFA.finalStates.has(i)) {
                    livingFinal.push(i);
                } else {
                    livingNotFinal.push(i);
                }
            } else {
                if (this.originalDFA.finalStates.has(i)) {
                    deadFinal.push(i);
                } else {
                    deadNotFinal.push(i);
                }
            }
        }

        const stateSetQueue = [
            this.newStateSet(livingFinal),
            this.newStateSet(livingNotFinal),
            this.newStateSet(deadFinal),
            this.newStateSet(deadNotFinal),
        ];
        const minSateSets: StateSet[] = [];
        while (stateSetQueue.length > 0) {
            const stateSet = stateSetQueue.shift();
            if (stateSet == null) {
                throw Error();
            }
            if (stateSet.value.length == 0) {
                this.allStateSets.delete(stateSet.id);
                continue;
            }
            if (stateSet.value.length == 1) {
                minSateSets.push(stateSet);
                continue;
            }

            const result = this.separateStateSet(stateSet);
            if (result.length == 1) {
                minSateSets.push(result[0]);
            } else {
                stateSetQueue.push(...result);
            }
        }

        for (let i = 0; i < this.originalDFA.states.length; i++) {
            const state = this.originalDFA.states[i];
            for (let j = 0; j < state.length; j++) {
                if (state[j] < 0) {
                    continue;
                }
                const fromState = this.stateSetMap[i].value[0];
                const toState = this.stateSetMap[state[j]].value[0];
                this.originalDFA.states[fromState][j] = toState;
            }
        }

        const newSates = new Set<number>();
        for (let i = 0; i < this.originalDFA.states.length; i++) {
            newSates.add(this.stateSetMap[i].value[0]);
        }

        const newFinalStates = new Set<number>();
        this.originalDFA.finalStates.forEach((state) => {
            newFinalStates.add(this.stateSetMap[state].value[0]);
        });

        const newInitialState =
            this.stateSetMap[this.originalDFA.initialState].value[0];

        const newStateQueue: number[] = [newInitialState];
        const outTempMap = new Map<number, DFAState>();
        const outStates = new Set<DFAState>();
        const outFinalStates = new Set<DFAState>();

        let newStateName = 1;
        newSates.forEach((state) => {
            const outState = new DFAState();
            outState.name = newStateName.toString();
            newStateName++;
            outTempMap.set(state, outState);
            outStates.add(outState);
            if (newFinalStates.has(state)) {
                outFinalStates.add(outState);
            }
        });

        while (newStateQueue.length > 0) {
            const stateId = newStateQueue.shift();
            if (stateId == null) {
                throw Error();
            }
            const state = outTempMap.get(stateId);
            if (state == null) {
                throw Error();
            }
            if (state.paths.length > 0) {
                continue;
            }
            for (let i = 0; i < this.charSet.length; i++) {
                const pathToId = this.originalDFA.states[stateId][i];
                if (pathToId < 0) {
                    continue;
                }
                const pathTo = outTempMap.get(pathToId);
                if (pathTo == null) {
                    throw Error();
                }

                newStateQueue.push(pathToId);
                const pathChar = this.charSet[i];
                const path: DFAPath = {
                    to: pathTo,
                    char: pathChar,
                };
                state.paths.push(path);
            }
        }

        const outInitialState = outTempMap.get(newInitialState);
        if (outInitialState == null) {
            throw Error();
        }

        return {
            initialState: outInitialState,
            finalStates: outFinalStates,
            states: outStates,
        };
    }
}
