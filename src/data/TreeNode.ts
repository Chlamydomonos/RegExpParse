export enum NodeType {
    CHAR, //字符
    CON, //连接
    OR, //选择
    CLO, //闭包
    PLUS, //正闭包
    OPT, //可选
}

export interface CharNode {
    type: NodeType.CHAR;
    value: string;
}

export interface ConNode {
    type: NodeType.CON;
    lChild: TreeNode;
    rChild: TreeNode;
}

export interface OrNode {
    type: NodeType.OR;
    lChild: TreeNode;
    rChild: TreeNode;
}

export interface CloNode {
    type: NodeType.CLO;
    lChild: TreeNode;
}

export interface PlusNode {
    type: NodeType.PLUS;
    lChild: TreeNode;
}

export interface OptNode {
    type: NodeType.OPT;
    lChild: TreeNode;
}

export type TreeNode =
    | CharNode
    | ConNode
    | OrNode
    | CloNode
    | PlusNode
    | OptNode;
