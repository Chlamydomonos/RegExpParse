import { NFAState, type NFA, type NFAPath } from './NFA';
import { NodeType, type TreeNode } from './TreeNode';

export default class NFAFactory {
    readonly nfa: NFA;
    constructor(node: TreeNode) {
        this.nfa = this.buildNFA(node);
        this.sortNFA(this.nfa);
    }

    private buildNFA(node: TreeNode): NFA {
        if (node.type == NodeType.CHAR) {
            return this.nfaForChar(node.value);
        } else if (node.type == NodeType.CON) {
            return this.nfaForCon(
                this.buildNFA(node.lChild),
                this.buildNFA(node.rChild)
            );
        } else if (node.type == NodeType.OR) {
            return this.nfaForOr(
                this.buildNFA(node.lChild),
                this.buildNFA(node.rChild)
            );
        } else if (node.type == NodeType.CLO) {
            return this.nfaForClo(this.buildNFA(node.lChild));
        } else if (node.type == NodeType.PLUS) {
            return this.nfaForPlus(this.buildNFA(node.lChild));
        } else if (node.type == NodeType.OPT) {
            return this.nfaForOpt(this.buildNFA(node.lChild));
        } else {
            throw Error();
        }
    }

    private connect(
        from: NFAState,
        to: NFAState,
        char: string,
        excludeFromSort?: true
    ): void {
        const path: NFAPath = {
            to: to,
            char: char,
        };
        if (excludeFromSort) {
            path.excludeFromSort = true;
        } else {
            to.pathsIn++;
        }
        from.paths.push(path);
    }

    private nfaForChar(char: string): NFA {
        const state1 = new NFAState();
        const state2 = new NFAState();
        this.connect(state1, state2, char);
        return {
            initialState: state1,
            lastState: state2,
            states: new Set([state1, state2]),
        };
    }

    private nfaForCon(lNFA: NFA, rNFA: NFA): NFA {
        this.connect(lNFA.lastState, rNFA.initialState, '');

        return {
            initialState: lNFA.initialState,
            lastState: rNFA.lastState,
            states: new Set([...lNFA.states, ...rNFA.states]),
        };
    }

    private nfaForOr(lNFA: NFA, rNFA: NFA): NFA {
        const state1 = new NFAState();
        const state2 = new NFAState();

        this.connect(state1, lNFA.initialState, '');
        this.connect(state1, rNFA.initialState, '');
        this.connect(lNFA.lastState, state2, '');
        this.connect(rNFA.lastState, state2, '');

        return {
            initialState: state1,
            lastState: state2,
            states: new Set([state1, state2, ...lNFA.states, ...rNFA.states]),
        };
    }

    private nfaForClo(nfa: NFA): NFA {
        const state1 = new NFAState();
        const state2 = new NFAState();

        this.connect(state1, nfa.initialState, '');
        this.connect(state1, state2, '');
        this.connect(nfa.lastState, state2, '');
        this.connect(nfa.lastState, nfa.initialState, '', true);

        return {
            initialState: state1,
            lastState: state2,
            states: new Set([state1, state2, ...nfa.states]),
        };
    }

    private nfaForPlus(nfa: NFA): NFA {
        const state1 = new NFAState();
        const state2 = new NFAState();

        this.connect(state1, nfa.initialState, '');
        this.connect(nfa.lastState, state2, '');
        this.connect(nfa.lastState, nfa.initialState, '', true);

        return {
            initialState: state1,
            lastState: state2,
            states: new Set([state1, state2, ...nfa.states]),
        };
    }

    private nfaForOpt(nfa: NFA): NFA {
        this.connect(nfa.initialState, nfa.lastState, '');
        return nfa;
    }

    private sortNFA(nfa: NFA): void {
        const sortingStates: NFAState[] = [nfa.initialState];
        const sortedStates: NFAState[] = [];
        while (sortingStates.length > 0) {
            const state = sortingStates.shift();
            if (state == null) {
                throw Error();
            }
            sortedStates.push(state);

            for (let i = 0; i < state.paths.length; i++) {
                const path = state.paths[i];
                if (!path.excludeFromSort) {
                    path.to.pathsIn--;
                    if (path.to.pathsIn == 0) {
                        sortingStates.push(path.to);
                    }
                }
            }
        }
        for (let i = 0; i < sortedStates.length; i++) {
            sortedStates[i].name = (i + 1).toString();
        }
    }
}
