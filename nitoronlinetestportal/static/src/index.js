import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './pages/App'
import { HashRouter } from "react-router-dom";
import "./style.css"
import {setupWindowEventBus} from "./Utils/eventBus";

setupWindowEventBus();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <HashRouter>
    <App />
  </HashRouter>
)

