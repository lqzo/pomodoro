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
  // win.webContents.openDevTools();
  win.loadFile("./index.html");
  handleIPC();
});

function handleIPC() {
  ipcMain.handle("work-end", async function () {
    let res = await new Promise((resolve, reject) => {
      let notification = new Notification({
        title: "任务结束",
        body: "是否开始休息",
        actions: [{ text: "开始休息", type: "button" }],
        closeButtonText: "继续工作",
      });
      notification.show();
      notification.on("action", () => {
        resolve("rest");
      });
      notification.on("close", () => {
        resolve("work");
      });
    });
    return res;
  });

  ipcMain.handle("rest-end", async function () {
    let res = await new Promise((resolve, reject) => {
      let notification = new Notification({
        title: "休息结束",
        body: "是否开始工作",
        actions: [{ text: "开始工作", type: "button" }],
        closeButtonText: "继续休息",
      });
      notification.show();
      notification.on("action", () => {
        resolve("work");
      });
      notification.on("close", () => {
        resolve("rest");
      });
    });
    return res;
  });
}
