import React, { useEffect, useState, useRef } from 'react';
import { ConnectDragSource, DragSource, DragSourceConnector } from 'react-dnd';
import { TreeItem, changeNodeAtPath, insertNode, removeNode } from '@nosferatu500/react-sortable-tree';
import { SortableTreeWithoutDndContext as SortableTree } from '@nosferatu500/react-sortable-tree';

import InputModal from './InputModalComponent';

import { IQuestionnaireItemType, Node } from '../types/types';

interface SortableTreeProps {
  treeData: TreeItem[];
  setTreeData: React.Dispatch<React.SetStateAction<TreeItem[]>>;
}

const SortableTreeComponent: React.FC<SortableTreeProps> = ({ treeData, setTreeData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [currentPath, setCurrentPath] = useState<number[] | null>(null);
  const [updatedTreeData, setUpdatedTreeData] = useState<TreeItem[]>(treeData);
  const [editValue, setEditValue] = useState<string>("");
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const [selectedNodes, setSelectedNodes] = useState<{ node: Node, path: number[] }[]>([]);

  const newNodeLinkId = 'NEW';
  const externalNodeType = 'yourNodeType';

  useEffect(() => {
    const placeholderDiv = document.querySelector('.rst__placeholder');
    if (placeholderDiv) {
      placeholderDiv.textContent = 'Drag and Drop elements';
    }
  }, [treeData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (treeContainerRef.current && !treeContainerRef.current.contains(event.target as HTMLElement)) {
        setSelectedNodes([]);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleOpenModal = (node: Node, treeData: Node[], nextTreeIndex: number) => {
    if (node.title === 'NEW') {
      setCurrentNode(node);
      setIsModalOpen(true);
    } else {
      // From here call the function that moves the nodes.
      if(selectedNodes.length > 1){
        // next treeIndex is where it is dropped
    
        handleMultipleMove(node, treeData, nextTreeIndex)
        return;
      }
      setTreeData(treeData)
    }
    setUpdatedTreeData(treeData)
  };

  const handleMultipleMove = (node: Node, treeData: TreeItem[], nextTreeIndex: number) => {
    let newTreeData = [...updatedTreeData];
  
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
    sortedSelectedNodes.forEach(({ node, path }) => {
      const result = removeNode({
        treeData: newTreeData,
        path,
        getNodeKey: ({ treeIndex }) => treeIndex,
      });
  
      if (result && result.treeData) {
        newTreeData = result.treeData;
      }
    });

    // Insert selected items in the dropped position
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
        depth: 0,
        minimumTreeIndex: nextTreeIndex + index,
        getNodeKey: ({ treeIndex }) => treeIndex,
      });
  
      if (result && result.treeData) {
        newTreeData = result.treeData;
      }
    });
  
    setTreeData(newTreeData);
    setUpdatedTreeData(newTreeData)
    setSelectedNodes([])
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentNode(null);
    setCurrentPath(null);
  };

  const handleSaveLabel = (label: string) => {
    if (currentNode && currentPath) {
      const newTreeData = changeNodeAtPath({
        treeData,
        path: currentPath,
        getNodeKey: ({ treeIndex }) => treeIndex,
        newNode: { ...currentNode, title: label },
      });
      setTreeData(newTreeData);

      // Updating this so that updatedTreeData is updated with treeData once saved
      setUpdatedTreeData(newTreeData)
    } else if(currentNode){
      const newTreeData = updatedTreeData.map((node) => {
        if (node.title === currentNode.title) {
          return { ...node, title: label };
        }
        return node;
      });
      setTreeData(newTreeData);
      setUpdatedTreeData(newTreeData)
    }
    handleCloseModal();
  };

  const handleOnDuplicate = (node: Node, path: number[]) => {
    const newNode = { ...node, title: `${node.title} (Copy)` };

    const result = insertNode({
      treeData,
      newNode,
      depth: path.length - 1,
      minimumTreeIndex: path[path.length - 1] + 1,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });

    if (result && result.treeData) {
      setTreeData(result.treeData);
    }
  };

  const getDisplayItem = (type: any) => {
    if (type === "string") {
      return <input placeholder="Enter a value" disabled />;
    } else if (type === "choice") {
      return (
        <select value={"select one"} disabled>
          <option label="Select a value" />
        </select>
      );
    } else if (type === "date") {
      return (
        <select value={"select one"} disabled>
          <option label="Select the date" />
        </select>
      );
    } else {
      return <input placeholder="URL Link" disabled />;
    }
  };

  const getIcon = (type :any) =>{
    if (type === "string") {
      return <i className="bi bi-input-cursor-text element-icon"></i>;
    } else if (type === "choice") {
      return (
        <i className="bi bi-menu-button-wide element-icon"></i>
      );
    } else if (type === "date") {
      return (
        <i className="bi bi-calendar2 element-icon"></i>
      );
    } else {
      return <i className="bi bi-link element-icon"></i>;
    }

  }

  const externalNodeSpec = {
    beginDrag: (componentProps: { node: Node }) => ({ node: { ...componentProps.node } }),
  };

  const externalNodeCollect = (connect: DragSourceConnector) => ({
    connectDragSource: connect.dragSource(),
  });

  const ExternalNodeBaseComponent = (props: { connectDragSource: ConnectDragSource; node: Node }): JSX.Element | null => {
    return props.connectDragSource(
      <div className="anchor-menu__dragcomponent">{getIcon(props?.node?.nodeType)} <span>{props?.node?.nodeReadableType}</span></div>,
      {
        dropEffect: 'copy',
      }
    );
  };

  const YourExternalNodeComponent = DragSource(
    externalNodeType,
    externalNodeSpec,
    externalNodeCollect
  )(ExternalNodeBaseComponent);

  const createTypeComponent = (type: IQuestionnaireItemType, text: string): JSX.Element => {
    return (
      <YourExternalNodeComponent
        node={{
          title: newNodeLinkId,
          nodeType: type,
          nodeReadableType: text,
          nodeContent: text,
          children: [],
        }}
      />
    );
  };

  interface NodeMoveEvent {
    treeData: Node[];
    node: Node;
    nextTreeIndex : number
  }

  const handleOnDelete = (path: number[]) =>{
    const result = removeNode({
      treeData,
      path,
      getNodeKey : ({treeIndex}) => treeIndex,
    });

    if(result && result.treeData){
      setTreeData(result.treeData)
    }
  }

  const handleOnSettings = (node : Node, path : number[]) =>{
    setCurrentNode(node);
    setIsModalOpen(true);
    setEditValue(node.title);
    setCurrentPath(path);
  }

  const isNodeHighlighted = (node: TreeItem, path: number[]) => {
    return selectedNodes.some(
      (item) => item.node === node && JSON.stringify(item.path) === JSON.stringify(path)
    );
  }  

  const handleOnMoveNode = (node : Node, path : number[]) =>{
    setSelectedNodes((prev) => {
      const nodeExists = prev.some(
        (item) => item.node === node
      );
  
      if (nodeExists) {
        return prev.filter(
          (item) => item.node !== node || JSON.stringify(item.path) !== JSON.stringify(path)
        );
      } else {
        return [...prev, { node, path }];
      }
    });
  }

  return (
    <div style={{ display: 'flex' }}>
      <div>
        {createTypeComponent(IQuestionnaireItemType.string, 'Text/Input')}
        {createTypeComponent(IQuestionnaireItemType.choice, 'Dropdown')}
        {createTypeComponent(IQuestionnaireItemType.date, 'Date')}
        {createTypeComponent(IQuestionnaireItemType.url, 'URL')}
      </div>

      <div className='sortable-tree-container' ref={treeContainerRef}>
        <SortableTree
          dndType={externalNodeType}
          treeData={treeData}
          onChange={(node) => { console.log(node)}}
          onMoveNode={({ treeData, node, nextTreeIndex }: NodeMoveEvent) => {
            handleOpenModal(node, treeData, nextTreeIndex);
          }}
          generateNodeProps={({node, path}) => ({
            onClick: () => {
              handleOnMoveNode(node, path)
            },  
            className: `anchor-menu__item`,
            title: (
              <div className="anchor-menu__inneritem" style={{ display: 'flex', flexDirection: 'column' }}>
                <label>{node.title}</label>
                <span className="anchor-menu__title">{getDisplayItem(node.nodeType)}</span>
              </div>
            ),
            buttons: [
              <>
                <button onClick={() => handleOnDuplicate(node, path)} className='icon-btn'>
                  <i className="bi bi-copy"></i>
                </button>
                <button onClick={() => handleOnDelete(path)} className='icon-btn'>
                  <i className="bi bi-trash3"></i>
                </button>
                <button onClick={() => handleOnSettings(node, path)} className='icon-btn'>
                  <i className="bi bi-gear"></i>
                </button>
              </>
            ],
            style: isNodeHighlighted(node, path) ? { border: "2px solid #1a67a0" } : {}
          })}
        />
      </div>
      <InputModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveLabel} initialValue={editValue} />
    </div>
  );
};

export default SortableTreeComponent;
