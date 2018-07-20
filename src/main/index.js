import { app, BrowserWindow, shell, Menu } from 'electron';

const updater = require('electron-simple-updater');
updater.init(
  'https://raw.githubusercontent.com/megahertz/electron-simple-updater/master/example/updates.json'
);

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  var menu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Preferences',
          click() {
            const modalPath =
              process.env.NODE_ENV === 'development'
                ? 'http://localhost:9080/#/preferences'
                : `file://${__dirname}/index.html#preferences`;
            let win = new BrowserWindow({
              width: 400,
              height: 320,
              frame: false,
              webPreferences: { webSecurity: false }
            });
            win.on('close', function() {
              win = null;
            });
            win.loadURL(modalPath);
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Info',
      submenu: [
        { label: 'About' },
        {
          label: 'Check for Updates'
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
