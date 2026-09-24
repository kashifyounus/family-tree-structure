import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import type { FamilyGraph } from "@/lib/graph/types";
import { formatBilingualName } from "@/lib/format/displayName";

const EMBED_HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=4"/>
<style>
  html,body{margin:0;height:100%;background:#0f1419;font-family:system-ui,sans-serif}
  #c{width:100%;height:100%;touch-action:none}
  .hint{position:fixed;bottom:8px;left:0;right:0;text-align:center;color:#94a3b8;font-size:11px}
</style>
</head><body>
<canvas id="c"></canvas>
<div class="hint">Pinch or scroll to zoom · drag to pan</div>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let nodes = [], edges = [], scale = 1, ox = 40, oy = 40;
let dragging = false, lx = 0, ly = 0;
function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; draw(); }
window.addEventListener('resize', resize);
function layout(g){
  nodes = (g.nodes||[]).map((n,i)=>({id:n.id,label:n.label||n.id,x:80+(i%6)*120,y:80+Math.floor(i/6)*90}));
  edges = g.edges||[];
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(ox,oy); ctx.scale(scale,scale);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  for(const e of edges){
    const a=nodes.find(n=>n.id===e.from), b=nodes.find(n=>n.id===e.to);
    if(!a||!b) continue;
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
  }
  for(const n of nodes){
    ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#38bdf8';
    ctx.beginPath(); ctx.roundRect(n.x-52,n.y-18,104,36,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e2e8f0'; ctx.font = '11px system-ui'; ctx.textAlign='center';
    ctx.fillText((n.label||'').slice(0,14), n.x, n.y+4);
  }
  ctx.restore();
}
canvas.addEventListener('pointerdown', e=>{ dragging=true; lx=e.clientX; ly=e.clientY; });
canvas.addEventListener('pointerup', ()=> dragging=false);
canvas.addEventListener('pointermove', e=>{
  if(!dragging) return;
  ox += e.clientX-lx; oy += e.clientY-ly; lx=e.clientX; ly=e.clientY; draw();
});
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  const f = e.deltaY>0?0.92:1.08;
  scale = Math.min(3, Math.max(0.4, scale*f));
  draw();
}, {passive:false});
function onGraph(g){ layout(g); resize(); }
document.addEventListener('message', e=>{ try{ onGraph(JSON.parse(e.data)); }catch(_){}});
window.addEventListener('message', e=>{ try{ onGraph(JSON.parse(e.data)); }catch(_){}});
resize();
</script></body></html>`;

function toCanvasPayload(graph: FamilyGraph) {
  return {
    nodes: graph.nodes.map((n) => ({
      id: n.id,
      label: formatBilingualName({
        firstName: n.data.person.firstName,
        lastName: n.data.person.lastName,
        urduFirstName: n.data.person.urduFirstName ?? null,
        urduLastName: n.data.person.urduLastName ?? null,
      }),
    })),
    edges: graph.edges.map((e) => ({ from: e.source, to: e.target })),
  };
}

type GraphWebViewProps = {
  graph: FamilyGraph;
  testID?: string;
};

/**
 * Offline-friendly graph renderer (canvas) — stable pan/zoom without native layout glitches.
 */
export function GraphWebView({ graph, testID }: GraphWebViewProps) {
  const webRef = useRef<WebView>(null);
  const payload = useMemo(() => JSON.stringify(toCanvasPayload(graph)), [graph]);

  return (
    <View style={styles.wrap} testID={testID}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: EMBED_HTML }}
        onLoadEnd={() => {
          webRef.current?.postMessage(payload);
        }}
        style={styles.web}
        scrollEnabled={false}
        setBuiltInZoomControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 320, borderRadius: 16, overflow: "hidden" },
  web: { flex: 1, backgroundColor: "#0f1419" },
});
