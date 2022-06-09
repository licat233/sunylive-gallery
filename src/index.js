import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import "./lib/popup";
import disableDevtool from 'disable-devtool';

function isDev() {
  const nowHost = window.location.host;
  if (nowHost.length === 0) return true;
  let hash = window.location.hash;
  //去除 #
  hash = hash.substring(1);
  const arr = hash.split("&");
  if (arr.some((item) => item === "development")) return true;
  const index = nowHost.search(":");
  return index !== -1
}

isDev() || disableDevtool();

// import reportWebVitals from './reportWebVitals';
// import 'animate.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
