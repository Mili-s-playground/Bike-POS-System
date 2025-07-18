const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

async function buildElectron() {
    try {
        console.log('Building React app...');
        await new Promise((resolve, reject) => {
            exec('npm run build', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(stdout);
                    resolve();
                }
            });
        });

        console.log('Copying server files...');
        await fs.copy('server', 'build/server');
        await fs.copy('package.json', 'build/package.json');

        // Copy electron files
        await fs.ensureDir('build/electron');
        await fs.copy('electron', 'build/electron');

        console.log('Building Electron app...');
        await new Promise((resolve, reject) => {
            exec('electron-builder --linux', (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(stdout);
                    resolve();
                }
            });
        });

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildElectron();