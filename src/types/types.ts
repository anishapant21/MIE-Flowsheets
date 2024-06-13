import { GetTreeItemChildrenFn, TreeItem } from "@nosferatu500/react-sortable-tree";
import { ReactNode } from "react";

export enum IQuestionnaireItemType {
    choice = 'choice',
    date = 'date',
    string = 'string',
    url = 'url',
  }
  
 export interface Node {
    title: string;
    hierarchy?: string;
    nodeType?: IQuestionnaireItemType;
    nodeReadableType?: string;
    children: Node[];
  }
  
  export interface NodeMoveEvent {
    treeData: Node[];
    node: Node;
    nextTreeIndex: number,
    nextPath: number[]
  }

export interface TreeItems {
  title?: ReactNode | undefined;
  subtitle?: ReactNode | undefined;
  expanded?: boolean | undefined;
  children?: TreeItem[] | GetTreeItemChildrenFn | undefined;
  nodeType?: string;
  nodeReadableType?: string;
  [x: string]: any;
}