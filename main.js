"use strict";var h=Object.create;var s=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var u=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty;var g=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports);var v=(e,n,r,i)=>{if(n&&typeof n=="object"||typeof n=="function")for(let t of E(n))!f.call(e,t)&&t!==r&&s(e,t,{get:()=>n[t],enumerable:!(i=w(n,t))||i.enumerable});return e};var a=(e,n,r)=>(r=e!=null?h(u(e)):{},v(n||!e||!e.__esModule?s(r,"default",{value:e,enumerable:!0}):r,e));var d=g((R,p)=>{"use strict";var c=require("electron");if(typeof c=="string")throw new TypeError("Not running in an Electron environment!");var _="ELECTRON_IS_DEV"in process.env,y=Number.parseInt(process.env.ELECTRON_IS_DEV,10)===1;p.exports=_?y:!c.app.isPackaged});var o=require("electron"),m=a(d()),l=a(require("path")),I=m.default?"http://localhost:3000":"dummyUrl",L=()=>{let e=new o.BrowserWindow({width:1024,height:690,webPreferences:{preload:l.default.join(__dirname,"preload.js"),nodeIntegration:!0,contextIsolation:!1}});o.ipcMain.handle("CurrentWindow",async()=>e),e.loadURL(I)};o.app.whenReady().then(()=>{L()});
