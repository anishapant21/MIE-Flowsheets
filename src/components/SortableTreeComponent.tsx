import React, { useEffect, useState, useRef } from 'react';
import { ConnectDragSource, DragSource, DragSourceConnector } from 'react-dnd';
import { TreeItem, changeNodeAtPath, insertNode, removeNode, getNodeAtPath } from '@nosferatu500/react-sortable-tree';
import { SortableTreeWithoutDndContext as SortableTree } from '@nosferatu500/react-sortable-tree';

import InputModal from './InputModalComponent';

import { IQuestionnaireItemType, Node, NodeMoveEvent } from '../types/types';
import { calculatePositionChange, insertNodeAtPosition, multiNodeDeletion, multiNodeInsertion, singleNodeDeletion } from '../utils/treeHandler';
import GetDisplayItems from './GetDisplayItems';
import GetDisplayIcons from './GetDisplayIcons';
import { externalNodeType, newNodeLinkId } from '../constants/constants';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface SortableTreeProps {
  treeData: TreeItem[];
  setTreeData: React.Dispatch<React.SetStateAction<TreeItem[]>>;
}

const SortableTreeComponent: React.FC<SortableTreeProps> = ({ treeData, setTreeData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpenModal, setIsDeleteOpenModal] = useState(false);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const [currentPath, setCurrentPath] = useState<number[] | null>(null);
  const [updatedTreeData, setUpdatedTreeData] = useState<TreeItem[]>(treeData);
  const [editValue, setEditValue] = useState<string>("");
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);


  const [selectedNodes, setSelectedNodes] = useState<{ node: Node, path: number[] }[]>([]);

  useEffect(() => {
    const placeholderDiv = document.querySelector('.rst__placeholder');
    if (placeholderDiv) {
      placeholderDiv.textContent = 'Drag and Drop elements';
    }
  }, [treeData]);

  const handleDeleteAllSelectedNodes = () => {
    const newTreeData = multiNodeDeletion(treeData, selectedNodes);

    setTreeData(newTreeData);
    setUpdatedTreeData(newTreeData)
    setSelectedNodes([]);
    setIsDeleteOpenModal(false)
  };

  const handleOpenModal = (node: Node, treeData: TreeItem[], nextTreeIndex: number, nextPath: number[]) => {
    if (node.title === 'NEW') {
      setCurrentNode(node);
      setIsModalOpen(true);
    } else {
      // From here call the function that moves the nodes.
      if (selectedNodes.length > 1) {
        // next treeIndex is where it is dropped

        handleMultipleMove(node, treeData, nextTreeIndex, nextPath)
        return;
      }
      setTreeData(treeData)
    }
    setUpdatedTreeData(treeData)
  };

  const handleMultipleMove = (node: Node, treeData: TreeItem[], nextTreeIndex: number, nextPath: number[]) => {
    let newTreeData = [...updatedTreeData];

    // positionDifference is to check weather the items is being dropped from top to bottom or bottom to top
    // It affects the treeData and items paths
    const positionDifference = calculatePositionChange(updatedTreeData, treeData, node)
    const insertAt = positionDifference && positionDifference > 0 ? nextTreeIndex + 1 : nextTreeIndex

    // If top to bottom first insertion and deletion and vice-versa
    if (positionDifference && positionDifference > 0) {
      newTreeData = multiNodeInsertion(newTreeData, selectedNodes, insertAt)
      newTreeData = multiNodeDeletion(newTreeData, selectedNodes)
    } else {
      newTreeData = multiNodeDeletion(newTreeData, selectedNodes)
      newTreeData = multiNodeInsertion(newTreeData, selectedNodes, insertAt)
    }

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
    } else if (currentNode) {
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

  const handleOnDuplicate = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, node: Node, path: number[]) => {
    event.stopPropagation();
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
      setUpdatedTreeData(result.treeData)
    }
  };

  const handleOnAddElementClick = (node: Node) => {
    const result = insertNodeAtPosition(node, treeData, treeData.length)
    if (result) {
      handleOpenModal(node, result, 0, [0])
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
      <div className="anchor-menu__dragcomponent"> <GetDisplayIcons type={props?.node?.nodeType} /> <span>{props?.node?.nodeReadableType}</span>
        <div className='plus-icon' onClick={() => { handleOnAddElementClick(props?.node) }}><i className="bi bi-plus-circle "></i></div> </div>,
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

  const handleOnDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, path: number[]) => {
    e.stopPropagation();

    const result = singleNodeDeletion(treeData, path)
    setTreeData(result)
    setUpdatedTreeData(result)
  }

  const handleOnSettings = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, node: Node, path: number[]) => {
    e.stopPropagation();

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

  const handleOnNodeClick = (event: React.MouseEvent, node: Node, path: number[], treeIndex: number) => {
    // select multiple nodes by clicking on shift and node
    if (event.shiftKey && lastSelectedIndex !== null) {
      // Select range of nodes between lastSelectedIndex and treeIndex
      let startIndex = Math.min(lastSelectedIndex, treeIndex);
      let endIndex = Math.max(lastSelectedIndex, treeIndex);

      // handle cases for reverse mode - lastSelectedIndex is the first one and treeIndex is the second one
      if (lastSelectedIndex > treeIndex) {
        startIndex = startIndex - 1;
        endIndex = endIndex - 1
      }

      const newSelectedNodes: { node: Node; path: number[]; }[] = [];
      for (let i = startIndex + 1; i <= endIndex; i++) {
        const result = getNodeAtPath({
          treeData,
          path: [i],
          getNodeKey: ({ treeIndex }) => treeIndex,
        });

        if (result && result.node && result.treeIndex) {
          newSelectedNodes.push({ node: result.node as Node, path: [result.treeIndex] as number[] });
        }

      }

      setSelectedNodes((prev) => {
        return [...prev, ...newSelectedNodes]
      });
    } else {
      setSelectedNodes((prev) => {
        const nodeExists = prev.some(
          (item) => item.node === node && JSON.stringify(item.path) === JSON.stringify(path)
        );

        if (nodeExists) {
          return prev.filter(
            (item) => item.node !== node || JSON.stringify(item.path) !== JSON.stringify(path)
          );
        } else {
          return [...prev, { node, path }];
        }
      });
      setLastSelectedIndex(treeIndex);
    }
  };

  const handleOnClickDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
    setIsDeleteOpenModal(true)

  }

  return (
    <div>
      <div className={`header-wrapper ${selectedNodes.length > 0 ? "" : "d-none"}`}>
        <div className='title'>
          <svg onClick={()=> setSelectedNodes([])} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>

          <span className='items-selected'>{selectedNodes.length} selected</span>

        </div>

        <div className='delete-multiple p-2' onClick={(e) => handleOnClickDelete(e)}> <i className="bi bi-trash" ></i>Delete</div>

      </div>
      <div className='container'>
        <div className='elements-container'>
          {createTypeComponent(IQuestionnaireItemType.string, 'Text/Input')}
          {createTypeComponent(IQuestionnaireItemType.choice, 'Dropdown')}
          {createTypeComponent(IQuestionnaireItemType.date, 'Date')}
          {createTypeComponent(IQuestionnaireItemType.url, 'URL')}
        </div>

        <div className='sortable-tree-container' ref={treeContainerRef}>

          <SortableTree
            dndType={externalNodeType}
            treeData={treeData}
            onChange={(node) => { console.log(node) }}
            onMoveNode={({ treeData, node, nextTreeIndex, nextPath }: NodeMoveEvent) => {
              handleOpenModal(node, treeData, nextTreeIndex, nextPath);
            }}
            generateNodeProps={({ node, path, treeIndex }) => ({
              onClick: (event: React.MouseEvent) => {
                event.stopPropagation();
                const target = event.target as HTMLElement;
                const clickedItemClassName = target.className;

                if (
                  clickedItemClassName !== 'rstcustom__expandButton' &&
                  clickedItemClassName !== 'rst__collapseButton'
                ) {

                  handleOnNodeClick(event, node, path, treeIndex)
                }

              },
              className: `anchor-menu__item ${isNodeHighlighted(node, path) ? "selectedHighlight" : ""}`,
              title: (
                <div className="anchor-menu__inneritem" style={{ display: 'flex', flexDirection: 'column' }}>
                  <label>{node.title}</label>
                  <span className="anchor-menu__title"><GetDisplayItems type={node.nodeType} /></span>
                </div>
              ),
              buttons: [
                <>
                  <button onClick={(e) => handleOnDuplicate(e, node, path)} className='icon-btn'>
                    <i className="bi bi-copy"></i>
                  </button>
                  <button onClick={(e) => handleOnDelete(e, path)} className='icon-btn'>
                    <i className="bi bi-trash3"></i>
                  </button>
                  <button onClick={(e) => handleOnSettings(e, node, path)} className='icon-btn'>
                    <i className="bi bi-gear"></i>
                  </button>
                </>
              ],
            })}
          />
        </div>
        <InputModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveLabel} initialValue={editValue} />
        <DeleteConfirmationModal isOpen={isDeleteOpenModal} onClose={() => setIsDeleteOpenModal(!isDeleteOpenModal)} onDelete={handleDeleteAllSelectedNodes} selectedNodesLength={selectedNodes.length} />
      </div>
    </div>

  );
};

export default SortableTreeComponent;
