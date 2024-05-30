import { useState } from 'react'
import { TreeItem } from '@nosferatu500/react-sortable-tree';

import "../components/SortableTreeComponent"
import SortableTreeComponent from '../components/SortableTreeComponent'

const HomePage = () => {
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  return (
    <>
      <SortableTreeComponent treeData={treeData} setTreeData={setTreeData} />
    </>
  )
}

export default HomePage