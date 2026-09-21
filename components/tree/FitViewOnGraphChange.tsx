"use client";

import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";

type FitViewOnGraphChangeProps = {
  nodeCount: number;
  padding?: number;
};

export function FitViewOnGraphChange({
  nodeCount,
  padding = 0.2,
}: FitViewOnGraphChangeProps) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodeCount === 0) return;
    const id = requestAnimationFrame(() => {
      fitView({ padding, duration: 200, maxZoom: 1.15, minZoom: 0.12 });
    });
    return () => cancelAnimationFrame(id);
  }, [nodeCount, padding, fitView]);

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
