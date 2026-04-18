import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import mdxeditor styles FIRST so our overrides in globals.css take precedence.
import '@mdxeditor/editor/style.css';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
