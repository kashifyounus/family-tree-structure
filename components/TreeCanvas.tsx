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
import { FitViewOnGraphChange } from "@/components/tree/FitViewOnGraphChange";

const nodeTypes = { person: PersonNode };

type TreeCanvasProps = {
  graph: FamilyGraph;
  onSelectPerson: (personId: string) => void;
  onGraphChange?: (graph: FamilyGraph) => void;
};

function graphToFlow(
  graph: FamilyGraph,
  runExpand: (
    nodeId: string,
    data: PersonNodeData,
    direction: "up" | "down" | "both",
  ) => void,
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = graph.nodes.map((n) => {
    const data = n.data as PersonNodeData;
    return {
      id: n.id,
      type: "person",
      position: n.position,
      data: {
        ...data,
        onExpandBranch: (direction: "up" | "down" | "both") =>
          runExpand(n.id, data, direction),
      },
    };
  });
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
  const [isExpanding, startExpand] = useTransition();

  const runExpand = useCallback(
    (nodeId: string, data: PersonNodeData, direction: "up" | "down" | "both") => {
      if (!data.hasUnexpandedParents && !data.hasUnexpandedChildren) return;

      const node = graph.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      startExpand(async () => {
        const merged = await expandFamilyGraph(
          nodeId,
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

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => graphToFlow(graph, runExpand),
    [graph, runExpand],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const flow = graphToFlow(graph, runExpand);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [graph, runExpand, setNodes, setEdges]);

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
      runExpand(node.id, data, direction);
    },
    [runExpand],
  );

  return (
    <div
      className="tree-canvas-host rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      data-testid="tree-canvas"
    >
      {isExpanding && (
        <div
          className="pointer-events-none absolute right-2 top-10 z-10 rounded-lg bg-white/95 px-2 py-1 text-xs text-zinc-600 shadow dark:bg-zinc-900/95"
          aria-live="polite"
        >
          Loading branch…
        </div>
      )}
      <p className="pointer-events-none absolute left-2 top-2 z-10 max-w-[85%] text-[10px] leading-snug text-zinc-500">
        Drag to pan · pinch to zoom · tap a card for profile
      </p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll={false}
        zoomOnPinch
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling
        minZoom={0.08}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <FitViewOnGraphChange nodeCount={nodes.length} padding={0.25} />
        <Background gap={16} color="#e4e4e7" />
        <Controls
          showInteractive={false}
          position="bottom-right"
          className="!bottom-2 !right-2 !m-0 scale-90 sm:scale-100"
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
