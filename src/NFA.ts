export class NFAState {
    name = '';
    paths: NFAPath[] = [];
    pathsIn = 0;
}

export interface NFAPath {
    to: NFAState;
    char: string;
    excludeFromSort?: true;
}

export interface NFA {
    initialState: NFAState;
    lastState: NFAState;
    states: Set<NFAState>;
}
