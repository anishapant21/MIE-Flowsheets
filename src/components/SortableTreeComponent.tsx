import React, { useEffect, useState } from 'react';
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

  const newNodeLinkId = 'NEW';
  const externalNodeType = 'yourNodeType';

  useEffect(() => {
    const placeholderDiv = document.querySelector('.rst__placeholder');
    if (placeholderDiv) {
      placeholderDiv.textContent = 'Drag and Drop elements';
    }
  }, [treeData]);

  const handleOpenModal = (node: Node, treeData: Node[]) => {
    // Check if the node is new or already exists
    if (node.title === 'NEW') {
      setCurrentNode(node);
      setIsModalOpen(true);
    } else {
      setTreeData(treeData)
    }
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
    } else if(currentNode){
      const newTreeData = updatedTreeData.map((node) => {
        if (node.title === currentNode.title) {
          return { ...node, title: label };
        }
        return node;
      });
      setTreeData(newTreeData);
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
    setEditValue(node.title)
    setCurrentPath(path)
  }

  return (
    <div style={{ display: 'flex' }}>
      <div>
        {createTypeComponent(IQuestionnaireItemType.string, 'Text/Input')}
        {createTypeComponent(IQuestionnaireItemType.choice, 'Dropdown')}
        {createTypeComponent(IQuestionnaireItemType.date, 'Date')}
        {createTypeComponent(IQuestionnaireItemType.url, 'URL')}
      </div>

      <div className='sortable-tree-container'>
        <SortableTree
          dndType={externalNodeType}
          treeData={treeData}
          onChange={() => { }}
          onMoveNode={({ treeData, node }: NodeMoveEvent) => {
            handleOpenModal(node, treeData);
            setUpdatedTreeData(treeData);
          }}
          generateNodeProps={({node, path}) => ({
            className: `anchor-menu__item`,
            title: (
              <div className="anchor-menu__inneritem" style={{ display: 'flex', flexDirection: 'column' }}>
                <label>{node.title}</label>
                <span className="anchor-menu__title">{getDisplayItem(node.nodeType)}</span>
              </div>
            ),
            buttons: [
              <>
                <button onClick={() => handleOnDuplicate(node, path)}  className='icon-btn'>
                  <i className="bi bi-copy"></i>
                </button>
                <button onClick={() => handleOnDelete(path)} className='icon-btn'>
                  <i className="bi bi-trash3"></i>
                </button>
                <button onClick = {() => handleOnSettings(node, path)} className='icon-btn'>
                <i className="bi bi-gear"></i>
                </button>
               
              </>
            ]
          })}
        />
      </div>

      <InputModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveLabel} initialValue={editValue}/>
    </div>
  );
};

export default SortableTreeComponent;
