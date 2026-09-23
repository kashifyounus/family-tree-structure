"use client";

import { useMemo } from "react";
import { useNodes, useViewport } from "@xyflow/react";
import type { FamilyGraphEdge } from "@/types/family";
import { buildPedigreeConnectorSegments } from "../../shared/pedigreeConnectors";

const NODE_W = 140;
const NODE_H = 72;

type PedigreeConnectorsLayerProps = {
  edges: FamilyGraphEdge[];
};

export function PedigreeConnectorsLayer({ edges }: PedigreeConnectorsLayerProps) {
  const nodes = useNodes();
  const { x, y, zoom } = useViewport();

  const segments = useMemo(() => {
    const boxes = nodes.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      width: NODE_W,
      height: NODE_H,
    }));
    const pedigreeEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type ?? "parent",
      label: e.label,
    }));
    return buildPedigreeConnectorSegments(boxes, pedigreeEdges);
  }, [nodes, edges]);

  if (segments.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
      aria-hidden
    >
      {segments.map((s) => (
        <line
          key={s.id}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={s.kind === "spouse" ? "#f43f5e" : "#6366f1"}
          strokeWidth={s.kind === "spouse" ? 2.5 : 2}
          strokeOpacity={0.75}
        />
      ))}
    </svg>
  );
}
