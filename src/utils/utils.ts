import { TreeItem, getFlatDataFromTree, GetNodeKeyFunction } from "@nosferatu500/react-sortable-tree";

interface ClientOffset {
  x: number;
  y: number;
}

interface FlatDataItem {
  node: TreeItem;
  path: (string | number)[];
  lowerSiblingCounts: number[];
  treeIndex: number;
}

const findClosestNode = (clientOffset: ClientOffset, treeData: TreeItem[]) => {
  // Get the flat data to easily traverse through nodes
  const flatData: FlatDataItem[] = getFlatDataFromTree({
      treeData,
      getNodeKey: ({ treeIndex }: { treeIndex: number; }) => treeIndex,
  }) as unknown as FlatDataItem[];

  // For simplicity, assume nodes are evenly spaced vertically
  const itemHeight = 40;
  const dropY = clientOffset.y;

  let closestNode: TreeItem | null = null;
  let parentNode: TreeItem | null = null;
  let closestDistance = Infinity;

  flatData.forEach(({ node, path, treeIndex }) => {
    const nodeY = treeIndex * itemHeight;
    const distance = Math.abs(nodeY - dropY);

    if (distance < closestDistance) {
      closestNode = node;
      parentNode = path.length > 1 ? treeData[path[path.length - 2] as number] : null;
      closestDistance = distance;
    }
  });

  return { parentNode, closestNode };
};

export default findClosestNode;
