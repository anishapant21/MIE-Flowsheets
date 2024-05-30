import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

import { DndProvider, DragSource, DragSourceConnector, ConnectDragSource } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { createDragDropManager } from 'dnd-core'

export const manager = createDragDropManager(HTML5Backend)

const props = {
  manager,
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DndProvider {...props}>
    {/* <DndProvider backend={HTML5Backend} context={window}> */}
    <App />

    {/* </DndProvider> */}
     
    </DndProvider>
  </React.StrictMode>,
);
