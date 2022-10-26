import { NodeType, type TreeNode } from './TreeNode';

export default class Parser {
    readonly root: TreeNode;
    constructor(regExp: string) {
        this.root = this.parse(regExp, 0, false).node;
    }
    private parse(
        regExp: string,
        from: number,
        inBrackets: boolean
    ): {
        node: TreeNode;
        index: number;
    } {
        const charStack: TreeNode[] = [];
        const opStack: string[] = [];
        let readChar = false;
        for (let i = from; i < regExp.length; i++) {
            const current = regExp[i];
            if (current == '|') {
                readChar = false;
                opStack.push(current);
            } else if (current == '*') {
                readChar = true;
                this.popStacks(charStack, opStack);
                const temp = charStack.pop();
                if (temp == null) {
                    throw Error();
                }
                charStack.push({
                    type: NodeType.CLO,
                    lChild: temp,
                });
            } else if (current == '+') {
                readChar = true;
                this.popStacks(charStack, opStack);
                const temp = charStack.pop();
                if (temp == null) {
                    throw Error();
                }
                charStack.push({
                    type: NodeType.PLUS,
                    lChild: temp,
                });
            } else if (current == '?') {
                readChar = true;
                this.popStacks(charStack, opStack);
                const temp = charStack.pop();
                if (temp == null) {
                    throw Error();
                }
                charStack.push({
                    type: NodeType.OPT,
                    lChild: temp,
                });
            } else if (current == '(') {
                if (readChar) {
                    this.popStacks(charStack, opStack);
                    opStack.push('');
                }
                readChar = true;
                const result = this.parse(regExp, i + 1, true);
                charStack.push(result.node);
                i = result.index;
            } else if (current == ')') {
                if (!inBrackets) {
                    throw Error();
                }
                this.popStacks(charStack, opStack);
                if (charStack.length != 1 && opStack.length != 0) {
                    throw Error();
                }

                return { index: i, node: charStack[0] };
            } else {
                if (readChar) {
                    this.popStacks(charStack, opStack);
                    opStack.push('');
                }
                readChar = true;
                charStack.push({
                    type: NodeType.CHAR,
                    value: current,
                });
            }
        }

        if (inBrackets) {
            throw Error();
        }
        this.popStacks(charStack, opStack);
        if (charStack.length != 1 && opStack.length != 0) {
            throw Error();
        }
        return { node: charStack[0], index: -1 };
    }

    //
    private popStacks(charStack: TreeNode[], opStack: string[]): void {
        if (charStack.length == 0 && opStack.length > 0) {
            throw Error();
        }
        while (opStack.length > 0) {
            if (charStack.length < 2) {
                throw Error();
            }

            const rChar = charStack.pop();
            const lChar = charStack.pop();
            const op = opStack.pop();

            if (lChar == null || rChar == null || op == null) {
                throw Error();
            }

            if (op == '') {
                charStack.push({
                    type: NodeType.CON,
                    lChild: lChar,
                    rChild: rChar,
                });
            } else {
                charStack.push({
                    type: NodeType.OR,
                    lChild: lChar,
                    rChild: rChar,
                });
            }
        }
    }
}
