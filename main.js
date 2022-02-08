const { app, BrowserWindow, Notification, ipcMain } = require("electron");

let win;

app.on("ready", () => {
  win = new BrowserWindow({
    width: 520,
    height: 520,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // debug
  // win.webContents.openDevTools();

  // load file
  win.loadFile("./index.html");
  handleIPC();
});

function handleIPC() {
  ipcMain.handle(
    "notification",
    async (e, { body, title, actions, closeButtonText }) => {
      let res = await new Promise((resolve, reject) => {
        let notification = new Notification({
          title,
          body,
          actions,
          closeButtonText,
        });
        notification.show();
        notification.on("action", function (event) {
          resolve({ event: "action" });
        });
        notification.on("close", function (event) {
          resolve({ event: "close" });
        });
      });
      return res;
    }
  );
}
