const canvas = document.getElementById("runtimeCanvas");
const ctx = canvas.getContext("2d");
const activeStage = document.getElementById("activeStage");
const tokensAvoided = document.getElementById("tokensAvoided");

const stages = ["Observe", "Understand", "Plan", "Execute", "Verify", "Learn", "Heal", "Optimize"];
const modules = [
  { label: "Command Center", color: "#27c7d8" },
  { label: "Runtime Core", color: "#42c77b" },
  { label: "Efficiency Engine", color: "#f5b841" },
  { label: "ODIL", color: "#f26f63" },
  { label: "DCRS + Nango", color: "#7257ff" },
  { label: "Long-Horizon Swarms", color: "#8ee7f0" },
  { label: "Meta-Harness", color: "#c4f26f" },
  { label: "Governance", color: "#ff9f7a" }
];

let tick = 0;

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(bounds.width * scale));
  canvas.height = Math.max(1, Math.floor(bounds.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawNode(x, y, radius, label, color, active) {
  ctx.beginPath();
  ctx.arc(x, y, radius + (active ? 8 : 0), 0, Math.PI * 2);
  ctx.fillStyle = active ? `${color}33` : "rgba(255,255,255,0.05)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#151f2c";
  ctx.fill();
  ctx.strokeStyle = active ? color : "rgba(255,255,255,0.18)";
  ctx.lineWidth = active ? 3 : 1;
  ctx.stroke();

  ctx.fillStyle = active ? color : "#d7dde4";
  ctx.font = "700 13px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(label, x, y, radius * 1.45, 16);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((item, index) => ctx.fillText(item, x, startY + index * lineHeight));
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  const centerX = width * 0.5;
  const centerY = height * 0.44;
  const orbit = Math.min(width, height) * 0.31;
  const activeIndex = Math.floor(tick / 80) % modules.length;
  const stageIndex = Math.floor(tick / 48) % stages.length;
  activeStage.textContent = stages[stageIndex];
  tokensAvoided.textContent = (42180 + Math.floor(tick * 7.5)).toLocaleString();

  const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, orbit * 1.6);
  gradient.addColorStop(0, "rgba(39, 199, 216, 0.18)");
  gradient.addColorStop(0.5, "rgba(66, 199, 123, 0.08)");
  gradient.addColorStop(1, "rgba(17, 24, 39, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  for (let r = orbit * 0.55; r <= orbit * 1.15; r += orbit * 0.3) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const nodePositions = modules.map((module, index) => {
    const angle = (Math.PI * 2 * index) / modules.length - Math.PI / 2;
    return {
      ...module,
      x: centerX + Math.cos(angle) * orbit,
      y: centerY + Math.sin(angle) * orbit
    };
  });

  nodePositions.forEach((node, index) => {
    const next = nodePositions[(index + 1) % nodePositions.length];
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(next.x, next.y);
    ctx.strokeStyle = index === activeIndex ? node.color : "rgba(255,255,255,0.15)";
    ctx.lineWidth = index === activeIndex ? 3 : 1;
    ctx.stroke();
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, orbit * 0.36, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 20px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CAIRO", centerX, centerY - 16);
  ctx.fillStyle = "#c6d0da";
  ctx.font = "600 13px Inter, system-ui, sans-serif";
  ctx.fillText("Conscious Runtime", centerX, centerY + 12);

  nodePositions.forEach((node, index) => {
    drawNode(node.x, node.y, Math.max(48, orbit * 0.19), node.label, node.color, index === activeIndex);
  });

  const particleAngle = (tick / 70) % (Math.PI * 2);
  const px = centerX + Math.cos(particleAngle) * orbit;
  const py = centerY + Math.sin(particleAngle) * orbit;
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  tick += 1;
  requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();
