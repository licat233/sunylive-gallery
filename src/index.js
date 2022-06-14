import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import "./lib/popup";
// import disableDevtool from 'disable-devtool';
// import { authPhoneNumber } from './api/api';

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

function banDevtool() {
  //屏蔽键盘事件
  document.onkeydown = function () {
    var e = window.event || this._arguments[0];
    //F12
    if (e.keyCode === 123) {
      return false;
      //Ctrl+Shift+I
    } else if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      return false;
      //Shift+F10
    } else if (e.shiftKey && e.keyCode === 121) {
      return false;
      //Ctrl+U
    } else if (e.ctrlKey && e.keyCode === 85) {
      return false;
    }
  };
  //屏蔽鼠标右键
  document.oncontextmenu = function () {
    return false;
  };
};

!isDev() || banDevtool();

// async function auth() {
//   const layer = window.layer
//   layer.prompt({ title: '请输入你的手机号码', formType: 0 }, async function (text, index) {
//     await authPhoneNumber({ phone_number: text })
//     layer.close(index);
//   });
// }

// auth();

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
