import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { buildPedigreeCanvasPayload } from "@/lib/graph/pedigreeCanvasPayload";
import type { FamilyGraph } from "@/lib/graph/types";

const EMBED_HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4"/>
<style>
  html,body{margin:0;height:100%;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif}
  #c{width:100%;height:100%;touch-action:none}
  .hint{position:fixed;bottom:10px;left:0;right:0;text-align:center;color:#6b7280;font-size:11px;pointer-events:none}
</style>
</head><body>
<canvas id="c"></canvas>
<div class="hint">Pinch or scroll to zoom · drag to pan · tap a person</div>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let nodes = [], segments = [], focalId = '';
let scale = 1, ox = 0, oy = 0;
let dragging = false, lx = 0, ly = 0, moved = 0;

function genderAccent(g){
  if(g==='FEMALE') return '#f4a6c1';
  if(g==='MALE') return '#7eb6e0';
  return '#c4c4c4';
}
function avatarFill(g, deceased){
  if(deceased) return '#e5e7eb';
  if(g==='FEMALE') return '#fde8f0';
  if(g==='MALE') return '#e3f0fb';
  return '#f3f4f6';
}

function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; draw(); }

function fitView(){
  if(!nodes.length){ return; }
  const pad = 56;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const n of nodes){
    minX=Math.min(minX,n.x); minY=Math.min(minY,n.y);
    maxX=Math.max(maxX,n.x+n.w); maxY=Math.max(maxY,n.y+n.h);
  }
  for(const s of segments){
    minX=Math.min(minX,s.x1,s.x2); minY=Math.min(minY,s.y1,s.y2);
    maxX=Math.max(maxX,s.x1,s.x2); maxY=Math.max(maxY,s.y1,s.y2);
  }
  const cw=Math.max(1,maxX-minX+pad*2), ch=Math.max(1,maxY-minY+pad*2);
  scale = Math.min(canvas.width/cw, canvas.height/ch, 1.12);
  scale = Math.max(0.32, scale);
  const focal = nodes.find(n=>n.id===focalId) || nodes.find(n=>n.isFocal) || nodes[0];
  const fx = focal.x + focal.w/2;
  const fy = focal.y + focal.h;
  ox = canvas.width/2 - fx * scale;
  oy = canvas.height * 0.74 - fy * scale;
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

function drawSegments(){
  ctx.strokeStyle = '#b8bcc4';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for(const s of segments){
    ctx.beginPath();
    ctx.moveTo(s.x1,s.y1);
    ctx.lineTo(s.x2,s.y2);
    ctx.stroke();
  }
}

function drawCard(n){
  const x=n.x, y=n.y, w=n.w, h=n.h;
  ctx.save();
  ctx.shadowColor = 'rgba(15,23,42,0.12)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  roundRect(x,y,w,h,12);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = n.isFocal ? '#1b4332' : '#e5e7eb';
  ctx.lineWidth = n.isFocal ? 2.5 : 1;
  roundRect(x,y,w,h,12);
  ctx.stroke();

  const barH = 5;
  ctx.fillStyle = genderAccent(n.gender);
  roundRect(x,y,w,barH+4,12);
  ctx.fill();
  ctx.fillRect(x,y+barH,w,2);

  const cx = x + w/2;
  const cy = y + 36;
  const r = 22;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI*2);
  ctx.fillStyle = avatarFill(n.gender, n.isDeceased);
  ctx.fill();
  ctx.strokeStyle = genderAccent(n.gender);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = n.isPrivate ? '#9ca3af' : '#1f2937';
  ctx.font = '600 13px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((n.initials||'?').slice(0,2), cx, cy);

  ctx.fillStyle = '#111827';
  ctx.font = '600 11px system-ui';
  const name = (n.label||'').length>16 ? (n.label||'').slice(0,15)+'…' : (n.label||'');
  ctx.fillText(name, cx, y + 68);

  if(n.years){
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px system-ui';
    ctx.fillText(n.years, cx, y + 84);
  }

  if(n.hasUnexpandedParents){
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, y - 10, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4b5563';
    ctx.font = '10px system-ui';
    ctx.fillText('↑', cx, y - 10);
  }
  if(n.hasUnexpandedChildren){
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(cx, y + h + 10, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4b5563';
    ctx.fillText('↓', cx, y + h + 10);
  }

  if(n.isFocal){
    ctx.strokeStyle = 'rgba(27,67,50,0.35)';
    ctx.lineWidth = 3;
    roundRect(x-3,y-3,w+6,h+6,14);
    ctx.stroke();
  }
  ctx.restore();
}

function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(ox,oy);
  ctx.scale(scale,scale);
  drawSegments();
  for(const n of nodes) drawCard(n);
  ctx.restore();
}

function hitNode(clientX, clientY){
  const x = (clientX - ox) / scale;
  const y = (clientY - oy) / scale;
  for(let i=nodes.length-1;i>=0;i--){
    const n=nodes[i];
    if(x>=n.x&&x<=n.x+n.w&&y>=n.y&&y<=n.y+n.h) return n;
  }
  return null;
}

function postPersonPress(n){
  const payload = JSON.stringify({type:'personPress', id:n.id, familyCode:n.familyCode});
  if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
}

function onGraph(g){
  nodes = g.nodes || [];
  segments = g.segments || [];
  focalId = g.focalPersonId || '';
  fitView();
  resize();
}

canvas.addEventListener('pointerdown', e=>{ dragging=true; moved=0; lx=e.clientX; ly=e.clientY; });
canvas.addEventListener('pointerup', e=>{
  if(dragging && moved < 10){
    const n = hitNode(e.clientX, e.clientY);
    if(n) postPersonPress(n);
  }
  dragging=false;
});
canvas.addEventListener('pointermove', e=>{
  if(!dragging) return;
  moved += Math.abs(e.clientX-lx)+Math.abs(e.clientY-ly);
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
  onPersonPress?: (person: FamilyGraph["nodes"][0]["data"]["person"]) => void;
};

/**
 * Offline-friendly pedigree renderer (canvas) — FamilySearch-style cards + connectors.
 */
export function GraphWebView({ graph, testID, onPersonPress }: GraphWebViewProps) {
  const webRef = useRef<WebView>(null);
  const payload = useMemo(
    () => JSON.stringify(buildPedigreeCanvasPayload(graph)),
    [graph],
  );

  return (
    <View style={styles.wrap} testID={testID}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: EMBED_HTML }}
        onLoadEnd={() => {
          webRef.current?.postMessage(payload);
        }}
        onMessage={(event) => {
          if (!onPersonPress) return;
          try {
            const msg = JSON.parse(event.nativeEvent.data) as {
              type?: string;
              id?: string;
            };
            if (msg.type !== "personPress" || !msg.id) return;
            const node = graph.nodes.find((n) => n.id === msg.id);
            if (node) onPersonPress(node.data.person);
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
  web: { flex: 1, backgroundColor: "#f3f4f6" },
});
