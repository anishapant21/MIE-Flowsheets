import React, { useState } from 'react';
import '@nosferatu500/react-sortable-tree/style.css';
import { TreeItem } from '@nosferatu500/react-sortable-tree';

import SortableTreeComponent from './components/SortableTreeComponent';

import "./App.css"
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeItem[]>([]);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      <div style={{ marginTop: '20px' }}>
        {/* <SortableTreeComponent treeData={treeData} setTreeData={setTreeData} /> */}
        <HomePage />
      </div>
    </div>
  );
};

export default App;
