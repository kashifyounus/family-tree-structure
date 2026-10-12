/**
 * Same canvas renderer as family-tree-app/components/tree/GraphWebView.tsx (production WebView embed).
 */
window.createPedigreeCanvasRenderer = function createPedigreeCanvasRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  let nodes = [];
  let segments = [];
  let highlightSegments = [];
  let highlightPersonIds = null;
  let focalId = "";
  let marriageBands = [];
  let framingNodeIds = null;
  let chevronOffset = 8;
  let fitMode = "pedigree";
  let marriageLabelEn = "Married";
  let marriageLabelUr = "";
  let theme = {
    canvas: "#F6F1E7",
    connector: "#8A9E94",
    primary: "#1B4332",
    surface: "#FFFDF8",
    focalFill: "#E8F5EE",
  };
  let scale = 1;
  let ox = 0;
  let oy = 0;

  function genderAccent(g, maternal) {
    if (maternal) return "#9B5670";
    if (g === "FEMALE") return "#f4a6c1";
    if (g === "MALE") return "#7eb6e0";
    return "#c4c4c4";
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitView() {
    if (!nodes.length) return;
    const pad = 48;
    const useIds =
      framingNodeIds && framingNodeIds.length
        ? new Set(framingNodeIds)
        : null;
    const viewNodes = useIds
      ? nodes.filter((n) => useIds.has(n.id))
      : nodes;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of viewNodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    }
    for (const s of segments) {
      minX = Math.min(minX, s.x1, s.x2);
      minY = Math.min(minY, s.y1, s.y2);
      maxX = Math.max(maxX, s.x1, s.x2);
      maxY = Math.max(maxY, s.y1, s.y2);
    }
    if (!Number.isFinite(minX)) return;
    const cw = Math.max(1, maxX - minX + pad * 2);
    const ch = Math.max(1, maxY - minY + pad * 2);
    scale = Math.min(canvas.width / cw, canvas.height / ch, 1.05);
    scale = Math.max(0.28, scale);
    const focal =
      viewNodes.find((n) => n.id === focalId) ||
      viewNodes.find((n) => n.isFocal) ||
      viewNodes[0];
    const fx = focal.x + focal.w / 2;
    const fy = focal.y + focal.h * 0.55;
    ox = canvas.width / 2 - fx * scale;
    oy = canvas.height * 0.72 - fy * scale;
  }

  function drawMarriageBand(band) {
    if (!band) return;
    const midY = band.y;
    const x1 = band.x1;
    const x2 = band.x2;
    if (x2 <= x1 + 8) return;
    const cx = (x1 + x2) / 2;
    const spouseColor = theme.connectorSpouse || "#8B2E3C";
    ctx.save();
    ctx.strokeStyle = spouseColor;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, midY);
    ctx.lineTo(x2, midY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = spouseColor;
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", cx, midY - 10);
    const cream = theme.canvas || "#F6F1E7";
    const line1 = marriageLabelEn || "Married";
    const line2 = marriageLabelUr || "";
    ctx.font = "500 10px system-ui";
    const tw = Math.max(
      ctx.measureText(line1).width,
      line2 ? ctx.measureText(line2).width : 0,
    );
    const padH = 8;
    const pillH = line2 ? 28 : 16;
    const pillW = tw + padH * 2;
    roundRect(cx - pillW / 2, midY + 4, pillW, pillH, 4);
    ctx.fillStyle = cream;
    ctx.fill();
    ctx.fillStyle = "#6b7280";
    ctx.fillText(line1, cx, midY + (line2 ? 12 : 14));
    if (line2) ctx.fillText(line2, cx, midY + 24);
    ctx.restore();
  }

  function wrapName(line, maxW) {
    if (!line) return "";
    if (ctx.measureText(line).width <= maxW) return line;
    let t = line;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  }

  function drawCard(n) {
    const x = n.x;
    const y = n.y;
    const w = n.w;
    const h = n.h;
    const isBig = n.tier === "big";
    const pad = 9;
    const barH = 5;
    const namePx = isBig ? 14 : 13;
    const nameLH = isBig ? 16 : 15;
    ctx.save();
    if (n.isGhost) ctx.globalAlpha = 0.62;
    ctx.shadowColor = "rgba(15,23,42,0.1)";
    ctx.shadowBlur = n.isGhost ? 0 : 6;
    ctx.shadowOffsetY = 2;
    roundRect(x, y, w, h, 12);
    ctx.fillStyle = n.isGhost
      ? "rgba(255,253,248,0.35)"
      : n.isFocal
        ? theme.focalFill || "#E8F5EE"
        : theme.surface || "#FFFDF8";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = n.isGhost ? "#9ca3af" : "#e5e7eb";
    ctx.lineWidth = n.isGhost ? 1.5 : 1;
    if (n.isGhost) ctx.setLineDash([5, 4]);
    roundRect(x, y, w, h, 12);
    ctx.stroke();
    if (n.isGhost) ctx.setLineDash([]);
    ctx.save();
    roundRect(x, y, w, h, 12);
    ctx.clip();
    ctx.fillStyle = n.bandColor || genderAccent(n.gender, n.maternalWing);
    ctx.fillRect(x, y, w, barH);
    ctx.restore();
    const cx = x + w / 2;
    const maxW = w - pad * 2;
    const roleEn = (n.roleLineEn || "").trim();
    const roleUr = (n.roleLineUr || "").trim();
    const rawLine2 = (n.nameLine2 || "").trim();
    const nameUr = rawLine2 ? wrapName(rawLine2, maxW) : "";
    const nameEn = nameUr
      ? wrapName((n.nameLine1 || "").trim(), maxW)
      : wrapName(n.label || (n.nameLine1 || "").trim(), maxW);
    let textTop = y + barH + pad;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    if (roleEn) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "600 9px system-ui";
      ctx.fillText(wrapName(roleEn, maxW), cx, textTop);
      textTop += 11;
    }
    if (roleUr) {
      ctx.font = "500 9px system-ui";
      ctx.fillText(wrapName(roleUr, maxW), cx, textTop);
      textTop += 11;
    }
    ctx.fillStyle = "#111827";
    ctx.font = `700 ${namePx}px system-ui`;
    ctx.fillText(nameEn, cx, textTop);
    if (nameUr) {
      ctx.font = `600 ${namePx - 1}px system-ui`;
      ctx.fillText(nameUr, cx, textTop + nameLH);
    }
    if (n.years) {
      ctx.font = "500 11px system-ui";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(
        n.years,
        cx,
        textTop + nameLH * (nameUr ? 2 : 1) + 5,
      );
    }
    if (n.isFocal) {
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 3;
      roundRect(x - 2, y - 2, w + 4, h + 4, 14);
      ctx.stroke();
      ctx.fillStyle = theme.primary;
      ctx.font = "9px system-ui";
      ctx.fillText("★", x + w - 10, y + h - 8);
    }
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.canvas;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    for (const s of segments) {
      ctx.strokeStyle = s.color || theme.connector;
      ctx.lineWidth = s.strokeWidth || 4;
      if (s.dashed) ctx.setLineDash([10, 6]);
      else ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const band of marriageBands) drawMarriageBand(band);
    for (const n of nodes) drawCard(n);
    ctx.restore();
  }

  function resize() {
    const parent = canvas.parentElement;
    const rect = parent
      ? parent.getBoundingClientRect()
      : canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    fitView();
    draw();
  }

  function loadPayload(g) {
    nodes = g.nodes || [];
    segments = g.segments || [];
    highlightSegments = g.highlightSegments || [];
    highlightPersonIds = g.highlightPersonIds || null;
    focalId = g.focalPersonId || "";
    marriageBands =
      g.marriageBands && g.marriageBands.length
        ? g.marriageBands
        : g.marriageBand
          ? [g.marriageBand]
          : [];
    framingNodeIds = g.framingNodeIds || null;
    chevronOffset = g.chevronOffset || 8;
    fitMode = g.fitMode === "timeline" ? "timeline" : "pedigree";
    marriageLabelEn = g.marriageLabelEn || "Married";
    marriageLabelUr = g.marriageLabelUr || "";
    if (g.theme) theme = { ...theme, ...g.theme };
    requestAnimationFrame(() => resize());
  }

  return { loadPayload, resize, draw };
};
