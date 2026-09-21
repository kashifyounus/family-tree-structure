"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useTransition } from "react";
import { expandFamilyGraph } from "@/actions/familyTree";
import type { FamilyGraph } from "@/types/family";
import { PersonNode, type PersonNodeData } from "@/components/PersonNode";

const nodeTypes = { person: PersonNode };

type TreeCanvasProps = {
  graph: FamilyGraph;
  onSelectPerson: (personId: string) => void;
  onGraphChange?: (graph: FamilyGraph) => void;
};

function graphToFlow(graph: FamilyGraph): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    type: "person",
    position: n.position,
    data: n.data,
  }));
  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.type === "spouse" ? "spouse" : undefined,
    targetHandle: e.type === "spouse" ? "spouse-in" : undefined,
    label: e.label,
    animated: e.type === "spouse",
    style:
      e.type === "spouse"
        ? { stroke: "#f43f5e", strokeWidth: 2 }
        : { stroke: "#6366f1", strokeWidth: 1.5 },
  }));
  return { nodes, edges };
}

function TreeCanvasInner({
  graph,
  onSelectPerson,
  onGraphChange,
}: TreeCanvasProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => graphToFlow(graph),
    [graph],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExpanding, startExpand] = useTransition();

  useEffect(() => {
    const flow = graphToFlow(graph);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [graph, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectPerson(node.id);
    },
    [onSelectPerson],
  );

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const data = node.data as PersonNodeData;
      const direction: "up" | "down" | "both" =
        data.hasUnexpandedChildren && !data.hasUnexpandedParents
          ? "down"
          : data.hasUnexpandedParents && !data.hasUnexpandedChildren
            ? "up"
            : "both";

      if (!data.hasUnexpandedParents && !data.hasUnexpandedChildren) {
        return;
      }

      startExpand(async () => {
        const merged = await expandFamilyGraph(
          node.id,
          direction,
          node.position,
          graph,
        );
        if (merged) {
          onGraphChange?.(merged);
        }
      });
    },
    [graph, onGraphChange],
  );

  return (
    <div className="relative h-full w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      {isExpanding && (
        <div
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg bg-white/90 px-2 py-1 text-xs text-zinc-600 shadow dark:bg-zinc-900/90"
          aria-live="polite"
        >
          Loading branch…
        </div>
      )}
      <p className="pointer-events-none absolute left-2 top-2 z-10 max-w-[70%] text-[10px] leading-snug text-zinc-500 sm:left-3 sm:top-3">
        Tap a node for profile · double-tap ↑/↓ to expand
      </p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.15}
        maxZoom={2}
        panOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#e4e4e7" />
        <Controls
          showInteractive={false}
          className="!bottom-2 !left-2 scale-90 sm:scale-100"
        />
        <MiniMap
          pannable
          zoomable
          className="!hidden !bg-white md:!block dark:!bg-zinc-900"
          nodeColor={(n) =>
            (n.data as PersonNodeData).isFocal ? "#6366f1" : "#a1a1aa"
          }
        />
      </ReactFlow>
    </div>
  );
}

export function TreeCanvas(props: TreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <TreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
