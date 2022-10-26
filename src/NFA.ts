export interface NFAState {
    name: string;
    paths: NFAPath[];
}

export interface NFAPath {
    from: NFAState;
    to: NFAState;
    char: string;
}

export interface NFA {
    initialState: NFAState;
    lastState: NFAState;
    states: Set<NFAState>;
}
