import type { NFA, NFAState } from '@/data/NFA';
import { FAGraph, type FAGraphNode } from './FAGraph';

export default class NFAGraphFactory {
    readonly graph = new FAGraph();

    constructor(nfa: NFA) {
        const stateMap = new Map<string, FAGraphNode>();
        const stateList: FAGraphNode[] = [];

        nfa.states.forEach((state) => {
            let category = 0;
            if (nfa.finalState.name == state.name) {
                category = 1;
            }
            if (nfa.initialState.name == state.name) {
                category += 2;
            }
            const node: FAGraphNode = {
                id: stateList.length,
                name: state.name,
                category: category,
            };
            stateList.push(node);
            stateMap.set(node.name, node);
        });

        const usedStates = new Set<string>();

        const stateQueue: NFAState[] = [nfa.initialState];

        while (stateQueue.length > 0) {
            const state = stateQueue.shift();
            if (state == null) {
                throw Error();
            }
            if (usedStates.has(state.name)) {
                continue;
            }
            usedStates.add(state.name);

            const from = stateMap.get(state.name);
            if (from == null) {
                throw Error();
            }

            const reachableStates = new Map<string, string[]>();
            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                stateQueue.push(path.to);
                if (!reachableStates.has(path.to.name)) {
                    reachableStates.set(path.to.name, []);
                }

                const chars = reachableStates.get(path.to.name);
                if (chars == null) {
                    throw Error();
                }

                chars.push(path.char);
            }

            reachableStates.forEach((chars, toName) => {
                const to = stateMap.get(toName);
                if (to == null) {
                    throw Error();
                }
                this.graph.links.push({
                    relation: {
                        id: this.graph.links.length,
                        name: this.genPathName(chars),
                    },
                    source: from.id,
                    target: to.id,
                });
            });
        }

        this.graph.nodes = stateList;
    }

    private genPathName(chars: string[]): string {
        let out = '';
        for (let i = 0; i < chars.length - 1; i++) {
            let char = chars[i];
            if (char == '') {
                char = 'ε';
            }
            out += `${char} / `;
        }
        let lastChar = chars[chars.length - 1];
        if (lastChar == '') {
            lastChar = 'ε';
        }
        out += lastChar;
        return out;
    }
}
