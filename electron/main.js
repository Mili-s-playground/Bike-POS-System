const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Determine if we're in development or production
const isDev = process.env.NODE_ENV === 'development' ||
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath);

let mainWindow;
let serverProcess;

// Start the Express server for production
function startServer() {
    if (!isDev) {
        const serverPath = path.join(__dirname, '../server/server.js');
        console.log('Starting server from:', serverPath);

        serverProcess = spawn('node', [serverPath], {
            cwd: path.join(__dirname, '..'),
            env: { ...process.env, NODE_ENV: 'production' }
        });

        serverProcess.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
        });

        serverProcess.on('close', (code) => {
            console.log(`Server process exited with code ${code}`);
        });
    }
}

function createWindow() {
    // Start server first in production
    if (!isDev) {
        startServer();
    }

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        show: false,
        titleBarStyle: 'default',
        frame: true,
        resizable: true, // Ensure window is resizable
        minimizable: true, // Ensure window is minimizable
        maximizable: true, // Ensure window is maximizable
        closable: true // Ensure window is closable
    });

    // Don't start maximized - let user control window size
    // mainWindow.maximize();

    // Load the appropriate URL/file
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    console.log('Loading URL:', startUrl);

    mainWindow.loadURL(startUrl).catch(err => {
        console.error('Failed to load URL:', err);

        // Fallback: try loading with a slight delay
        setTimeout(() => {
            mainWindow.loadURL(startUrl);
        }, 2000);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;

        // Kill server process when window closes
        if (serverProcess) {
            serverProcess.kill();
        }
    });

    // Handle navigation for security
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
            event.preventDefault();
        }
    });

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Product',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.location.pathname.includes('/dashboard/')) {
                                const outlet = window.location.pathname.split('/')[2];
                                window.location.href = '/products/' + outlet + '/add';
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                ...(isDev ? [{ role: 'toggleDevTools' }] : []),
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
                { role: 'zoom' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    // Kill server process
    if (serverProcess) {
        serverProcess.kill();
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    // Kill server process before quitting
    if (serverProcess) {
        serverProcess.kill();
    }
});