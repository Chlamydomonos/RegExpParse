export interface FATableItem {
    isInitial: boolean;
    isFinal: boolean;
    name: string;
    paths: string[];
}

export class FATable {
    items: FATableItem[] = [];
    charSet: string[] = [];
}
