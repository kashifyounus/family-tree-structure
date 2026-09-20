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
import { useCallback, useEffect, useMemo } from "react";
import type { FamilyGraph } from "@/types/family";
import { PersonNode } from "@/components/PersonNode";

const nodeTypes = { person: PersonNode };

type TreeCanvasProps = {
  graph: FamilyGraph;
  onSelectPerson: (personId: string) => void;
};

function TreeCanvasInner({ graph, onSelectPerson }: TreeCanvasProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: "person",
        position: n.position,
        data: n.data,
      })),
    [graph],
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => ({
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
      })),
    [graph],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectPerson(node.id);
    },
    [onSelectPerson],
  );

  return (
    <div className="h-full w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} color="#e4e4e7" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          className="!bg-white dark:!bg-zinc-900"
          nodeColor={(n) =>
            (n.data as { isFocal?: boolean }).isFocal ? "#6366f1" : "#a1a1aa"
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
