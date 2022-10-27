export interface FAGraphNode {
    id: number;
    name: string;
    category: number;
}

export interface FAGraphLink {
    relation: {
        id: number;
        name: string;
    };
    source: number;
    target: number;
}

export class FAGraph {
    nodes: FAGraphNode[] = [];
    links: FAGraphLink[] = [];
}
