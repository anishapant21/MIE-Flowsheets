import { TreeItem, insertNode } from "@nosferatu500/react-sortable-tree";
import { Node } from "../types/types";

export const insertNodeAtPosition = (node: Node, treeData : TreeItem [], index : number) =>{
    const result = insertNode({
        treeData: treeData,
        newNode: node,
        depth: 0,
        minimumTreeIndex: index,
        getNodeKey: ({ treeIndex }) => treeIndex,
      });


      if (result && result.treeData) {
        return result.treeData;
      }

}