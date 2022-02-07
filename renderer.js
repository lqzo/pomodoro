const { ipcRenderer } = require("electron");
const Timer = require("timer.js");

const workTimer = new Timer({
  ontick: (ms) => {
    updateCanvas(ms);
  },
  onend: () => {
    workEnd();
  },
});

function resetWorkTimer() {
  restTimer?.stop();
  workTimer.start(25 * 60);
  timeVal = 25 * 60 * 1000;
}

const restTimer = new Timer({
  ontick: (ms) => {
    updateCanvas(ms);
  },
  onend: () => {
    restEnd();
  },
});

function resetRestTimer() {
  workTimer?.stop();
  restTimer.start(5 * 60);
  timeVal = 5 * 60 * 1000;
}

let timeVal = 0;

async function workEnd() {
  let res = await ipcRenderer.invoke("work-end");
  if (res === "rest") {
    resetRestTimer();
  } else if (res === "work") {
    resetWorkTimer();
  }
}

async function restEnd() {
  let res = await ipcRenderer.invoke("rest-end");
  if (res === "rest") {
    resetRestTimer();
  } else if (res === "work") {
    resetWorkTimer();
  }
}

resetWorkTimer();

const startWordDom = document.querySelector(".start-work");
const endWordDom = document.querySelector(".end-work");
const startRestDom = document.querySelector(".start-rest");
const endRestDom = document.querySelector(".end-rest");

startWordDom.onclick = resetWorkTimer;

endWordDom.onclick = function () {
  workTimer.stop();
  workEnd();
};

startRestDom.onclick = resetRestTimer;

endRestDom.onclick = function () {
  restTimer.stop();
  restEnd();
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

// 更新 Canvas
function updateCanvas(ms) {
  // 清除canvas内容
  ctx.clearRect(0, 0, circleX * 2, circleY * 2);

  // 中间的字
  ctx.font = fontSize + "px Monaco";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#333";

  let s = Math.ceil(ms / 1000);
  let ss = s % 60;
  let mm = Math.floor(s / 60);

  ctx.fillText(
    `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`,
    circleX,
    circleY
  );

  // 圆形
  circle(circleX, circleY, radius);

  // 圆弧
  sector(circleX, circleY, radius, 0, (1 - ms / timeVal) * 360);
}
