import { GetTreeItemChildrenFn, TreeItem, insertNode } from "@nosferatu500/react-sortable-tree";
import { Node } from "../types/types";
import { ReactNode } from "react";

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


// Assuming TreeItem is already defined
export interface TreeItems {
  title?: ReactNode | undefined;
  subtitle?: ReactNode | undefined;
  expanded?: boolean | undefined;
  children?: TreeItem[] | GetTreeItemChildrenFn | undefined;
  nodeType?: string;
  nodeReadableType?: string;
  [x: string]: any;
}

export const calculatePositionChange = (updatedTreeData: TreeItems[], treeData: TreeItems[], node: TreeItem): number | null => {
  if (!node.title) {
    return null;
  }

  const titleToIndexMap = new Map<string, number>();
  const nodeTitle = node.title.toString();

  // Map titles to their positions in updatedTreeData
  updatedTreeData.forEach((item, index) => {
    if (item.title) {
      titleToIndexMap.set(item.title.toString(), index);
      console.log(`Mapped title: ${item.title} to index: ${index}`);
    }
  });

  // Find the position of the specified node in treeData
  for (let index = 0; index < treeData.length; index++) {
    const item = treeData[index];
    if (item.title && item.title.toString() === nodeTitle) {
      const originalIndex = titleToIndexMap.get(nodeTitle);
      console.log(`Checking title: ${nodeTitle} at index: ${index}, originalIndex: ${originalIndex}`);
      if (originalIndex !== undefined && originalIndex !== index) {
        console.log(`Title: ${nodeTitle} moved from ${originalIndex} to ${index}`);
        return index - originalIndex;
      }
    }
  }

  return null;
};