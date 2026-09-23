"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useTreeCanvasSize } from "@/components/tree/TreeCanvasContainer";

type FitViewOnGraphChangeProps = {
  nodeCount: number;
  padding?: number;
};

export function FitViewOnGraphChange({
  nodeCount,
  padding = 0.2,
}: FitViewOnGraphChangeProps) {
  const { fitView } = useReactFlow();
  const canvasSize = useTreeCanvasSize();
  const sizeKey = canvasSize
    ? `${canvasSize.width}x${canvasSize.height}`
    : "pending";

  useEffect(() => {
    if (nodeCount === 0) return;
    if (canvasSize && canvasSize.height < 50) return;
    const run = () =>
      fitView({ padding, duration: 200, maxZoom: 1.1, minZoom: 0.1 });
    const id = requestAnimationFrame(run);
    const t1 = window.setTimeout(run, 150);
    const t2 = window.setTimeout(run, 600);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [nodeCount, padding, fitView, sizeKey, canvasSize]);

  useEffect(() => {
    const onResize = () => {
      fitView({ padding, duration: 150, maxZoom: 1.15, minZoom: 0.12 });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [fitView, padding]);

  return null;
}
