export class DFAState {
    name = '';
    paths: DFAPath[] = [];
}

export interface DFAPath {
    to: DFAState;
    char: string;
}

export interface DFA {
    initialState: DFAState;
    finalStates: Set<DFAState>;
    states: Set<DFAState>;
}
