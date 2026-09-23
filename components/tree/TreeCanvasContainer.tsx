"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type TreeCanvasSize = { width: number; height: number };

const TreeCanvasSizeContext = createContext<TreeCanvasSize | null>(null);

export function useTreeCanvasSize(): TreeCanvasSize | null {
  return useContext(TreeCanvasSizeContext);
}

type TreeCanvasContainerProps = {
  children: ReactNode;
};

/** Ensures React Flow gets a real pixel height on mobile browsers (flex collapse fix). */
export function TreeCanvasContainer({ children }: TreeCanvasContainerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<TreeCanvasSize | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const measure = () => {
      const rect = outer.getBoundingClientRect();
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const top = rect.top;
      const reservedBottom = 140;
      const fromViewport = Math.floor(viewport - top - reservedBottom);
      const fromLayout = Math.floor(rect.height);
      const height = Math.max(
        280,
        fromLayout > 0 ? fromLayout : fromViewport,
        Math.min(fromViewport, viewport * 0.55),
      );
      const width = Math.max(1, Math.floor(rect.width));
      setSize({ width, height });
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(outer);

    const t1 = window.setTimeout(measure, 50);
    const t2 = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return (
    <TreeCanvasSizeContext.Provider value={size}>
      <div
        ref={outerRef}
        className="relative w-full min-h-[280px] flex-1 lg:min-h-0"
        style={
          size
            ? { height: size.height, minHeight: size.height }
            : { minHeight: 280 }
        }
        data-testid="tree-canvas-container"
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    </TreeCanvasSizeContext.Provider>
  );
}
