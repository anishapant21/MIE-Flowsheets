import { TreeItem, insertNode, removeNode } from "@nosferatu500/react-sortable-tree";
import { Node, TreeItems } from "../types/types";

export const insertNodeAtPosition = (node: Node, treeData: TreeItem[], index: number) => {
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
    }
  });

  // Find the position of the specified node in treeData
  for (let index = 0; index < treeData.length; index++) {
    const item = treeData[index];
    if (item.title && item.title.toString() === nodeTitle) {
      const originalIndex = titleToIndexMap.get(nodeTitle);
      if (originalIndex !== undefined && originalIndex !== index) {
        return index - originalIndex;
      }
    }
  }

  return null;
};

export interface SelectedNodes {
  node: Node,
  path: number[]
}

// Inserts multiple nodes in a given treeData starting at given index
export const multiNodeInsertion = (treeData: TreeItem[], selectedNodes: SelectedNodes[], insertNodeIndex: number, nextPath : number []) => {
  let newTreeData = [...treeData];

  let insertionTreeIndex = (index: number) =>{
    return nextPath.length > 1? insertNodeIndex : insertNodeIndex + index
  }

  const sortedSelectedNodesForInsertion = [...selectedNodes].sort((a, b) => {
    for (let i = 0; i < a.path.length; i++) {
      if (a.path[i] !== b.path[i]) {
        return a.path[i] - b.path[i];
      }
    }
    return 0;
  });

  // Insert each node into the new position
  sortedSelectedNodesForInsertion.forEach(({ node }, index) => {
    const result = insertNode({
      treeData: newTreeData,
      newNode: node,
      depth: nextPath.length - 1,
      minimumTreeIndex: insertionTreeIndex(index),
      getNodeKey: ({ treeIndex }) => treeIndex,
    });

    if (result && result.treeData) {
      newTreeData = result.treeData;
    }
  });

  return newTreeData;

}

// Deletes multiple nodes in a given treeData at given path
export const multiNodeDeletion = (treeData: TreeItem[], selectedNodes: SelectedNodes[]) => {
  let newTreeData = [...treeData];

  // Sort selected nodes by their path in descending order
  const sortedSelectedNodes = [...selectedNodes].sort((a, b) => {
    for (let i = 0; i < a.path.length; i++) {
      if (a.path[i] !== b.path[i]) {
        return b.path[i] - a.path[i];
      }
    }
    return 0;
  });

  // Remove all selected nodes from their original positions
  sortedSelectedNodes.forEach(({ path }) => {
    const result = removeNode({
      treeData: newTreeData,
      path,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });

    if (result && result.treeData) {
      newTreeData = result.treeData;
    }
  });

  return newTreeData;
}

export const singleNodeDeletion = (treeData: TreeItem[], path: number[]) => {
  let newtreeData = [...treeData]
  const result = removeNode({
    treeData,
    path,
    getNodeKey: ({ treeIndex }) => treeIndex,
  });

  if (result && result.treeData) {
    newtreeData = result.treeData
  }

  return newtreeData;
}