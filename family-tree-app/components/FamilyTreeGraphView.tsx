import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Line } from "react-native-svg";
import { Text, useTheme } from "react-native-paper";

import { formatGraphPersonName } from "@/lib/format/displayName";
import type { FamilyGraph, GraphPersonSummary } from "@/lib/graph/types";

const NODE_W = 148;
const NODE_H = 80;
const PADDING = 24;

type FamilyTreeGraphViewProps = {
  graph: FamilyGraph;
  onPersonPress?: (person: GraphPersonSummary) => void;
  zoomScale?: number;
  onZoomChange?: (scale: number) => void;
};

function genderIcon(
  gender: GraphPersonSummary["gender"],
): "gender-female" | "gender-male" | "account" {
  if (gender === "FEMALE") return "gender-female";
  if (gender === "MALE") return "gender-male";
  return "account";
}

function clampScale(value: number): number {
  return Math.min(2.5, Math.max(0.55, value));
}

export function FamilyTreeGraphView({
  graph,
  onPersonPress,
  zoomScale: controlledScale,
  onZoomChange,
}: FamilyTreeGraphViewProps) {
  const theme = useTheme();
  const { width: screenW } = useWindowDimensions();
  const [internalScale, setInternalScale] = useState(1);
  const scale = controlledScale ?? internalScale;
  const pinchBase = useMemo(() => ({ value: scale }), [scale]);

  const setScale = (next: number) => {
    const clamped = clampScale(next);
    if (onZoomChange) onZoomChange(clamped);
    else setInternalScale(clamped);
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      pinchBase.value = scale;
    })
    .onUpdate((e) => {
      setScale(pinchBase.value * e.scale);
    });

  const layout = useMemo(() => {
    if (graph.nodes.length === 0) {
      return { minX: 0, minY: 0, width: screenW, height: 200, nodes: [] };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of graph.nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + NODE_W);
      maxY = Math.max(maxY, n.position.y + NODE_H);
    }
    const w = maxX - minX + PADDING * 2;
    const h = maxY - minY + PADDING * 2 + 40;
    return {
      minX,
      minY,
      width: Math.max(screenW, w),
      height: h,
      nodes: graph.nodes,
    };
  }, [graph.nodes, screenW]);

  const nodeCenter = (id: string) => {
    const n = graph.nodes.find((x) => x.id === id);
    if (!n) return { x: 0, y: 0 };
    return {
      x: n.position.x - layout.minX + PADDING + NODE_W / 2,
      y: n.position.y - layout.minY + PADDING + NODE_H / 2,
    };
  };

  const scaledW = layout.width * scale;
  const scaledH = layout.height * scale;

  return (
    <GestureDetector gesture={pinch}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        style={styles.hScroll}
        contentContainerStyle={{ minWidth: scaledW }}
      >
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{
            width: scaledW,
            minHeight: scaledH,
          }}
        >
          <View
            style={{
              width: layout.width,
              height: layout.height,
              transform: [{ scale }],
            }}
          >
            <Svg
              width={layout.width}
              height={layout.height}
              style={StyleSheet.absoluteFill}
            >
              {graph.edges.map((e) => {
                const a = nodeCenter(e.source);
                const b = nodeCenter(e.target);
                const stroke =
                  e.type === "spouse"
                    ? theme.colors.secondary
                    : theme.colors.primary;
                return (
                  <Line
                    key={e.id}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={stroke}
                    strokeWidth={2}
                    strokeOpacity={0.65}
                  />
                );
              })}
            </Svg>
            {layout.nodes.map((n) => {
              const left = n.position.x - layout.minX + PADDING;
              const top = n.position.y - layout.minY + PADDING;
              const p = n.data.person;
              const focal = n.data.isFocal;
              const deceased = n.data.isDeceased;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => onPersonPress?.(p)}
                  style={[
                    styles.node,
                    {
                      left,
                      top,
                      backgroundColor: theme.colors.surface,
                      borderColor: focal ? theme.colors.primary : theme.colors.outline,
                      borderWidth: focal ? 2 : 1,
                      opacity: deceased ? 0.55 : 1,
                    },
                  ]}
                >
                  <View style={styles.nodeHeader}>
                    <MaterialCommunityIcons
                      name={genderIcon(p.gender)}
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text
                      variant="labelLarge"
                      numberOfLines={2}
                      style={{ color: theme.colors.onSurface, flex: 1 }}
                    >
                      {formatGraphPersonName(p)}
                    </Text>
                  </View>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                  >
                    {p.familyCode}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hScroll: { flex: 1 },
  node: {
    position: "absolute",
    width: NODE_W,
    minHeight: NODE_H,
    borderRadius: 12,
    padding: 8,
  },
  nodeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
});
