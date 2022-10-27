import type { DFA } from '@/data/DFA';
import { FATable } from './FATable';

export default class DFATableFactory {
    readonly table: FATable = new FATable();
    private charSet: string[] = [];
    private reverseCharSet = new Map<string, number>();

    constructor(dfa: DFA) {
        this.generateCharSet(dfa);

        const finalStateNames = new Set<string>();
        dfa.finalStates.forEach((state) => {
            finalStateNames.add(state.name);
        });

        dfa.states.forEach((state) => {
            const isInitial = dfa.initialState.name == state.name;
            const isFinal = finalStateNames.has(state.name);

            const paths: string[] = [];
            for (let i = 0; i < this.charSet.length; i++) {
                paths.push('');
            }

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                const charId = this.reverseCharSet.get(path.char);
                if (charId == null) {
                    throw Error();
                }
                paths[charId] = path.to.name;
            }

            this.table.items.push({
                name: state.name,
                isInitial: isInitial,
                isFinal: isFinal,
                paths: paths,
            });
        });
    }

    private generateCharSet(dfa: DFA) {
        const stateQueue = [dfa.initialState];
        const usedStateNames = new Set<string>();
        const tempCharSet = new Set<string>();
        while (stateQueue.length > 0) {
            const state = stateQueue.shift();
            if (state == null) {
                throw Error();
            }
            if (usedStateNames.has(state.name)) {
                continue;
            }
            usedStateNames.add(state.name);
            for (let i = 0; i < state.paths.length; i++) {
                tempCharSet.add(state.paths[i].char);
                stateQueue.push(state.paths[i].to);
            }
        }

        this.charSet = [...tempCharSet].sort((a, b) => {
            if (a.length == 0) {
                return -1;
            } else if (b.length == 0) {
                return 1;
            } else {
                return a.charCodeAt(0) - b.charCodeAt(0);
            }
        });

        for (let i = 0; i < this.charSet.length; i++) {
            this.reverseCharSet.set(this.charSet[i], i);
        }

        this.table.charSet = this.charSet;
    }
}
