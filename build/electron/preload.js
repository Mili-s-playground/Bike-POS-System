const { contextBridge } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Add any APIs you need to expose to the React app
    platform: process.platform,
    versions: process.versions
});