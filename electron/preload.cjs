const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('vortexDesktop', {
  platform: process.platform,
  isDesktop: true,
});
