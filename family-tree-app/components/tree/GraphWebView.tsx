import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";
import { kuriosityDesign } from "@/lib/design/kuriosityDesignSystem";

const EMBED_HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4"/>
<style>
  html,body{margin:0;height:100%;background:#F6F1E7;font-family:system-ui,-apple-system,sans-serif}
  #c{width:100%;height:100%;touch-action:none}
  .hint{position:fixed;bottom:10px;left:0;right:0;text-align:center;color:#6b7280;font-size:11px;pointer-events:none}
</style>
</head><body>
<canvas id="c"></canvas>
<div class="hint">Pinch or scroll to zoom · drag to pan · tap a person</div>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let nodes = [], segments = [], highlightSegments = [], highlightPersonIds = null, focalId = '', marriageBands = [], framingNodeIds = null, chevronOffset = 8, fitMode = 'pedigree', cousinOverlay = null, marriageLabelEn = 'Married', marriageLabelUr = '';
let theme = { canvas:'#F6F1E7', connector:'#8A9E94', primary:'#1B4332', surface:'#FFFDF8', focalFill:'#E8F5EE' };
let scale = 1, ox = 0, oy = 0;
let dragging = false, lx = 0, ly = 0, moved = 0;

function genderAccent(g, maternal){
  if(maternal) return '#9B5670';
  if(g==='FEMALE') return '#f4a6c1';
  if(g==='MALE') return '#7eb6e0';
  return '#c4c4c4';
}
function avatarFill(g, deceased){
  if(deceased) return '#e5e7eb';
  if(g==='FEMALE') return '#fde8f0';
  if(g==='MALE') return '#e3f0fb';
  return theme.surface || '#FFFDF8';
}

function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; draw(); }

function fitView(){
  if(!nodes.length){ return; }
  const pad = 48;
  const useIds = framingNodeIds && framingNodeIds.length ? new Set(framingNodeIds) : null;
  const viewNodes = useIds ? nodes.filter(n=>useIds.has(n.id)) : nodes;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const n of viewNodes){
    minX=Math.min(minX,n.x); minY=Math.min(minY,n.y);
    maxX=Math.max(maxX,n.x+n.w); maxY=Math.max(maxY,n.y+n.h);
  }
  for(const s of segments){
    minX=Math.min(minX,s.x1,s.x2); minY=Math.min(minY,s.y1,s.y2);
    maxX=Math.max(maxX,s.x1,s.x2); maxY=Math.max(maxY,s.y1,s.y2);
  }
  const pathFraming = highlightSegments && highlightSegments.length > 0;
  if(pathFraming){
    for(const s of highlightSegments){
      minX=Math.min(minX,s.x1,s.x2); minY=Math.min(minY,s.y1,s.y2);
      maxX=Math.max(maxX,s.x1,s.x2); maxY=Math.max(maxY,s.y1,s.y2);
    }
  }
  if(!Number.isFinite(minX)){ return; }
  const cw=Math.max(1,maxX-minX+pad*2), ch=Math.max(1,maxY-minY+pad*2);
  scale = Math.min(canvas.width/cw, canvas.height/ch, pathFraming ? 1.15 : 1.05);
  scale = Math.max(0.28, scale);
  if(pathFraming){
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    ox = canvas.width / 2 - cx * scale;
    oy = canvas.height / 2 - cy * scale;
    return;
  }
  const focal = viewNodes.find(n=>n.id===focalId) || viewNodes.find(n=>n.isFocal) || viewNodes[0];
  const fx = focal.x + focal.w/2;
  const fy = focal.y + focal.h * 0.55;
  ox = canvas.width/2 - fx * scale;
  if(fitMode === 'timeline'){
    let maxY = -Infinity;
    for(const n of viewNodes){ maxY = Math.max(maxY, n.y + n.h); }
    oy = canvas.height * 0.9 - maxY * scale;
  } else {
    oy = canvas.height * 0.72 - fy * scale;
  }
}

function roundRect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawMarriageBand(band){
  if(!band) return;
  const midY = band.y;
  const x1 = band.x1;
  const x2 = band.x2;
  if(x2 <= x1 + 8) return;
  const cx = (x1 + x2) / 2;
  ctx.save();
  ctx.strokeStyle = '#B83C3C';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.moveTo(x1, midY);
  ctx.lineTo(x2, midY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#B83C3C';
  ctx.font = '12px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♥', cx, midY - 10);
  const cream = theme.canvas || '#F6F1E7';
  const line1 = marriageLabelEn || 'Married';
  const line2 = marriageLabelUr || '';
  ctx.font = '500 10px system-ui';
  const tw = Math.max(ctx.measureText(line1).width, line2 ? ctx.measureText(line2).width : 0);
  const padH = 8;
  const pillH = line2 ? 28 : 16;
  const pillW = tw + padH * 2;
  roundRect(cx - pillW / 2, midY + 4, pillW, pillH, 4);
  ctx.fillStyle = cream;
  ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.fillText(line1, cx, midY + (line2 ? 12 : 14));
  if(line2) ctx.fillText(line2, cx, midY + 24);
  ctx.restore();
}

function drawMarriageBands(){
  for(const band of marriageBands) drawMarriageBand(band);
}

function drawSegments(){
  ctx.lineCap = 'round';
  for(const s of segments){
    ctx.strokeStyle = s.color || theme.connector;
    ctx.lineWidth = s.strokeWidth || 4;
    if(s.dashed) ctx.setLineDash([10, 6]);
    else ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(s.x1,s.y1);
    ctx.lineTo(s.x2,s.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  for(const s of highlightSegments){
    ctx.strokeStyle = s.color || '#7828A0';
    ctx.lineWidth = s.strokeWidth || 6;
    ctx.beginPath();
    ctx.moveTo(s.x1,s.y1);
    ctx.lineTo(s.x2,s.y2);
    ctx.stroke();
  }
}

function wrapName(line, maxW){
  if(!line) return '';
  if(ctx.measureText(line).width <= maxW) return line;
  let t = line;
  while(t.length>1 && ctx.measureText(t+'…').width > maxW) t = t.slice(0,-1);
  return t+'…';
}

function drawCard(n){
  const x=n.x, y=n.y, w=n.w, h=n.h;
  const isBig = n.tier === 'big';
  const pad = 9;
  const barH = 5;
  const namePx = isBig ? 14 : 13;
  const nameLH = isBig ? 16 : 15;
  const yearPx = 11;
  const yearGap = 5;
  ctx.save();
  if(n.isGhost){ ctx.globalAlpha = 0.62; }
  ctx.shadowColor = 'rgba(15,23,42,0.1)';
  ctx.shadowBlur = n.isGhost ? 0 : 6;
  ctx.shadowOffsetY = 2;
  roundRect(x,y,w,h,12);
  ctx.fillStyle = n.isGhost ? 'rgba(255,253,248,0.35)' : (n.isFocal ? (theme.focalFill || '#E8F5EE') : (theme.surface || '#FFFDF8'));
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = n.isGhost ? '#9ca3af' : '#e5e7eb';
  ctx.lineWidth = n.isGhost ? 1.5 : 1;
  if(n.isGhost) ctx.setLineDash([5, 4]);
  roundRect(x,y,w,h,12);
  ctx.stroke();
  if(n.isGhost) ctx.setLineDash([]);

  ctx.save();
  roundRect(x,y,w,h,12);
  ctx.clip();
  const barColor = n.bandColor || genderAccent(n.gender, n.maternalWing);
  ctx.fillStyle = barColor;
  ctx.fillRect(x, y, w, barH);
  ctx.restore();

  const cx = x + w/2;
  const maxW = w - pad * 2;
  const roleEn = (n.roleLineEn || '').trim();
  const roleUr = (n.roleLineUr || '').trim();
  const rawLine2 = (n.nameLine2 || '').trim();
  const nameUr = rawLine2 ? wrapName(rawLine2, maxW) : '';
  const nameEn = nameUr
    ? wrapName((n.nameLine1 || '').trim(), maxW)
    : wrapName(n.label || (n.nameLine1 || '').trim(), maxW);
  let textTop = y + barH + pad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  if(roleEn){
    ctx.fillStyle = '#6b7280';
    ctx.font = '600 9px system-ui';
    ctx.fillText(wrapName(roleEn, maxW), cx, textTop);
    textTop += 11;
  }
  if(roleUr){
    ctx.font = '500 9px system-ui';
    ctx.fillText(wrapName(roleUr, maxW), cx, textTop);
    textTop += 11;
  }
  ctx.fillStyle = '#111827';
  ctx.font = '700 ' + namePx + 'px system-ui';
  ctx.fillText(nameEn, cx, textTop);
  let yearsY = textTop + nameLH + yearGap;
  if(nameUr){
    ctx.font = '600 ' + (namePx - 1) + 'px system-ui';
    ctx.fillText(nameUr, cx, textTop + nameLH);
    yearsY = textTop + nameLH * 2 + yearGap;
  }
  if(n.nickname){
    ctx.font = '600 10px system-ui';
    ctx.fillStyle = theme.primary;
    ctx.fillText(n.nickname.slice(0,18), cx, yearsY);
    yearsY += 13;
  }
  if(n.years){
    ctx.font = '500 ' + yearPx + 'px system-ui';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(n.years, cx, yearsY);
  }

  const chev = chevronOffset || 8;
  if(n.hasUnexpandedParents){
    const cyUp = y - chev;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cyUp, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4b5563';
    ctx.font = '10px system-ui';
    ctx.fillText('↑', cx, cyUp);
  }
  if(n.hasUnexpandedChildren){
    const cyDn = y + h + chev;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(cx, cyDn, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4b5563';
    ctx.fillText('↓', cx, cyDn);
  }

  const hi = highlightPersonIds && highlightPersonIds.indexOf(n.id) >= 0;
  if(n.isFocal || hi){
    ctx.strokeStyle = hi ? '#7828A0' : (n.isSpouseCard ? '#B83C3C' : theme.primary);
    ctx.lineWidth = n.isFocal ? 3 : 2;
    roundRect(x-2,y-2,w+4,h+4,14);
    ctx.stroke();
  }
  if(n.isFocal){
    ctx.fillStyle = theme.primary;
    ctx.font = '9px system-ui';
    ctx.fillText('★', x + w - 10, y + h - 8);
  }
  if(n.isSharedAncestor){
    ctx.strokeStyle = '#E6B428';
    ctx.lineWidth = 2.5;
    roundRect(x-2,y-2,w+4,h+4,12);
    ctx.stroke();
  }
  ctx.restore();
}

function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = theme.canvas;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(ox,oy);
  ctx.scale(scale,scale);
  drawSegments();
  drawMarriageBands();
  for(const n of nodes) drawCard(n);
  ctx.restore();
}

function hitNode(clientX, clientY){
  const x = (clientX - ox) / scale;
  const y = (clientY - oy) / scale;
  for(let i=nodes.length-1;i>=0;i--){
    const n=nodes[i];
    if(n.isGhost) continue;
    if(x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h) return n;
  }
  return null;
}

function postToNative(msg){
  const payload = JSON.stringify(msg);
  if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
}
function postPersonPress(n){
  postToNative({type:'personPress', id:n.id, familyCode:n.familyCode});
}
function postPersonLongPress(n){
  postToNative({type:'personLongPress', id:n.id, familyCode:n.familyCode});
}

function onGraph(g){
  nodes = g.nodes || [];
  segments = g.segments || [];
  highlightSegments = g.highlightSegments || [];
  highlightPersonIds = g.highlightPersonIds || null;
  focalId = g.focalPersonId || '';
  marriageBands = g.marriageBands && g.marriageBands.length
    ? g.marriageBands
    : (g.marriageBand ? [g.marriageBand] : []);
  framingNodeIds = g.framingNodeIds || null;
  chevronOffset = g.chevronOffset || 8;
  fitMode = g.fitMode === 'timeline' ? 'timeline' : 'pedigree';
  cousinOverlay = g.cousinOverlay || null;
  marriageLabelEn = g.marriageLabelEn || 'Married';
  marriageLabelUr = g.marriageLabelUr || '';
  if(g.theme) theme = Object.assign(theme, g.theme);
  fitView();
  resize();
}

let longPressTimer = null;
let longPressNode = null;
let longPressFired = false;
const LONG_PRESS_MS = 480;

function clearLongPress(){
  if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }
  longPressNode = null;
}

canvas.addEventListener('pointerdown', e=>{
  dragging=true; moved=0; longPressFired=false; lx=e.clientX; ly=e.clientY;
  clearLongPress();
  const n = hitNode(e.clientX, e.clientY);
  if(n){
    longPressNode = n;
    longPressTimer = setTimeout(()=>{
      longPressFired = true;
      postPersonLongPress(n);
      clearLongPress();
    }, LONG_PRESS_MS);
  }
});
canvas.addEventListener('pointerup', e=>{
  if(longPressTimer) clearLongPress();
  if(dragging && moved < 10 && !longPressFired){
    const n = hitNode(e.clientX, e.clientY);
    if(n) postPersonPress(n);
  }
  dragging=false;
  longPressFired = false;
});
canvas.addEventListener('pointermove', e=>{
  if(!dragging) return;
  moved += Math.abs(e.clientX-lx)+Math.abs(e.clientY-ly);
  if(moved >= 10) clearLongPress();
  ox += e.clientX-lx; oy += e.clientY-ly; lx=e.clientX; ly=e.clientY; draw();
});
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const f = e.deltaY>0?0.92:1.08;
  const mx = e.clientX, my = e.clientY;
  const wx = (mx - ox) / scale, wy = (my - oy) / scale;
  scale = Math.min(2.2, Math.max(0.28, scale*f));
  ox = mx - wx * scale;
  oy = my - wy * scale;
  draw();
}, {passive:false});

let pinchDist = 0;
canvas.addEventListener('touchstart', e=>{
  if(e.touches.length===2){
    const dx=e.touches[0].clientX-e.touches[1].clientX;
    const dy=e.touches[0].clientY-e.touches[1].clientY;
    pinchDist=Math.hypot(dx,dy);
  }
},{passive:true});
canvas.addEventListener('touchmove', e=>{
  if(e.touches.length===2 && pinchDist>0){
    e.preventDefault();
    const dx=e.touches[0].clientX-e.touches[1].clientX;
    const dy=e.touches[0].clientY-e.touches[1].clientY;
    const d=Math.hypot(dx,dy);
    const f = d/pinchDist;
    pinchDist=d;
    const mx=(e.touches[0].clientX+e.touches[1].clientX)/2;
    const my=(e.touches[0].clientY+e.touches[1].clientY)/2;
    const wx=(mx-ox)/scale, wy=(my-oy)/scale;
    scale=Math.min(2.2,Math.max(0.28,scale*f));
    ox=mx-wx*scale; oy=my-wy*scale;
    draw();
  }
},{passive:false});

document.addEventListener('message', e=>{ try{ onGraph(JSON.parse(e.data)); }catch(_){}});
window.addEventListener('message', e=>{ try{ onGraph(JSON.parse(e.data)); }catch(_){}});
window.addEventListener('resize', resize);
resize();
</script></body></html>`;

type GraphWebViewProps = {
  graph: FamilyGraph;
  testID?: string;
  pathHighlightPersonIds?: string[];
  highlightPersonIds?: string[];
  fitMode?: "pedigree" | "timeline";
  edgeToEdge?: boolean;
  onPersonPress?: (person: FamilyGraph["nodes"][0]["data"]["person"]) => void;
  onPersonLongPress?: (person: FamilyGraph["nodes"][0]["data"]["person"]) => void;
};

/**
 * Offline-friendly pedigree renderer (canvas) — FamilySearch-style cards + connectors.
 */
export function GraphWebView({
  graph,
  testID,
  pathHighlightPersonIds,
  highlightPersonIds,
  fitMode = "pedigree",
  edgeToEdge = false,
  onPersonPress,
  onPersonLongPress,
}: GraphWebViewProps) {
  const webRef = useRef<WebView>(null);
  const payload = useMemo(
    () =>
      JSON.stringify({
        ...buildPedigreeCanvasPayload(graph, {
          pathHighlightPersonIds,
          highlightPersonIds,
        }),
        fitMode,
      }),
    [graph, pathHighlightPersonIds, highlightPersonIds, fitMode],
  );

  useEffect(() => {
    webRef.current?.postMessage(payload);
  }, [payload]);

  return (
    <View
      style={[styles.wrap, edgeToEdge && styles.wrapEdge]}
      testID={testID}
    >
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: EMBED_HTML }}
        onLoadEnd={() => {
          webRef.current?.postMessage(payload);
        }}
        onContentProcessDidTerminate={() => {
          webRef.current?.postMessage(payload);
        }}
        onMessage={(event) => {
          if (!onPersonPress && !onPersonLongPress) return;
          try {
            const msg = JSON.parse(event.nativeEvent.data) as {
              type?: string;
              id?: string;
            };
            if (!msg.id) return;
            const node = graph.nodes.find((n) => n.id === msg.id);
            if (!node) return;
            if (msg.type === "personLongPress") {
              onPersonLongPress?.(node.data.person);
              return;
            }
            if (msg.type === "personPress") {
              onPersonPress?.(node.data.person);
            }
          } catch {
            // ignore malformed messages from canvas
          }
        }}
        style={styles.web}
        scrollEnabled={false}
        setBuiltInZoomControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 320, borderRadius: 12, overflow: "hidden" },
  wrapEdge: { borderRadius: 0, minHeight: 280 },
  web: { flex: 1, backgroundColor: kuriosityDesign.brand.pedigreeCanvas },
});
