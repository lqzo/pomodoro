const { ipcRenderer } = require("electron");
const Timer = require("timer.js");

const workTime = 25 * 60; // 工作时长
const restTime = 5 * 60; // 休息时长
let type = 0; // 0 开始工作 1 停止工作 2 开始休息 3 停止休息
const workTimer = new Timer({
  ontick: (ms) => {
    updateCanvas(Math.ceil(ms / 1000), type < 2 ? workTime : restTime);
  },
  onstop: () => {
    type = 0;
    updateCanvas(0, 1);
  },
  onend: () => {
    if (type === 1) {
      type = 2;
      updateCanvas(0, 1);
      if (process.platform === "darwin") {
        notification({
          title: "恭喜你完成任务",
          body: "是否开始休息?",
          actionText: "休息五分钟",
          closeButtonText: "继续工作",
          onaction: startRest,
          onclose: startWork,
        });
      } else {
        alert("工作结束");
      }
    } else if (type === 3) {
      type = 0;
      updateCanvas(0, 1);
      if (process.platform === "darwin") {
        notification({
          title: "休息结束",
          body: "开始新的工作吧！",
          actionText: "开始工作",
          closeButtonText: "继续休息",
          onaction: startWork,
          onclose: startRest,
        });
      } else {
        alert("休息结束");
      }
    }
  },
});

function startWork() {
  type = 1;
  workTimer.start(workTime);
}

function startRest() {
  type = 3;
  workTimer.start(restTime);
}

async function notification({
  title,
  body,
  actionText,
  closeButtonText,
  onclose,
  onaction,
}) {
  let res = await ipcRenderer.invoke("notification", {
    title,
    body,
    actions: [{ text: actionText, type: "button" }],
    closeButtonText,
  });
  res.event === "close" ? onclose() : onaction();
}

const switchBtn = document.getElementById("switch-btn");

switchBtn.onclick = function () {
  if (this.innerText === "开始工作") {
    startWork();
  } else if (this.innerText === "开始休息") {
    startRest();
  } else {
    workTimer.stop();
  }
};

const canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  circleX = canvas.width / 2, // 中心x坐标
  circleY = canvas.height / 2, // 中心y坐标
  radius = 100, // 圆环半径
  lineWidth = 18, // 圆形线条的宽度
  fontSize = 30; // 字体大小

// 画圆
function circle(cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx + r, cy);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "#eee";
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
}

// 画弧线
function sector(cx, cy, r, startAngle, endAngle, anti) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r); // 从圆形底部开始画
  ctx.lineWidth = lineWidth;

  // 渐变色 - 可自定义
  var linGrad = ctx.createLinearGradient(
    circleX,
    circleY - radius - lineWidth,
    circleX,
    circleY + radius + lineWidth
  );
  linGrad.addColorStop(0.0, "#ec847a");
  linGrad.addColorStop(0.5, "#ed5a65");
  linGrad.addColorStop(1.0, "#eccd23");
  ctx.strokeStyle = linGrad;

  // 圆弧两端的样式
  ctx.lineCap = "round";

  // 圆弧
  ctx.arc(
    cx,
    cy,
    r,
    startAngle * (Math.PI / 180.0) + Math.PI / 2,
    endAngle * (Math.PI / 180.0) + Math.PI / 2,
    anti
  );
  ctx.stroke();
}

// 默认一个完成的
updateCanvas(0, 1);
// 更新 Canvas
function updateCanvas(s, maxTime) {
  // 清除canvas内容
  ctx.clearRect(0, 0, circleX * 2, circleY * 2);

  // 中间的字
  ctx.font = fontSize + "px Monaco";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#333";

  let ss = s % 60;
  let mm = Math.floor(s / 60);

  ctx.fillText(
    `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`,
    circleX,
    circleY
  );

  // 圆形
  circle(circleX, circleY, radius);

  console.log(s, maxTime, (1 - s / maxTime) * 360);
  // 圆弧
  sector(circleX, circleY, radius, 0, (1 - s / maxTime) * 360);

  // 更新操作按钮文案
  if (type === 0) {
    switchBtn.innerText = "开始工作";
  } else if (type === 1) {
    switchBtn.innerText = "停止工作";
  } else if (type === 2) {
    switchBtn.innerText = "开始休息";
  } else {
    switchBtn.innerText = "停止休息";
  }
}
