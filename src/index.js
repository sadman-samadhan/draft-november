import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import MediaEditorExample from "./components/editor"
import View from './components/view';

// const rootDom = document.getElementById('root');
const viewDom = document.getElementById('view');

if(!viewDom){
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <MediaEditorExample />
  // </React.StrictMode>
);
}
else{
const view = ReactDOM.createRoot(document.getElementById('view'));
view.render(
  // <React.StrictMode>
    <View />
  // </React.StrictMode>
);
}
