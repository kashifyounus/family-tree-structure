import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";
import { Text, useTheme } from "react-native-paper";

import { copy } from "@/content/businessCopy";
import { formatGraphPersonName } from "@/lib/format/displayName";
import type { FamilyGraph, GraphPersonSummary } from "@/lib/graph/types";
import { clampGraphScale } from "@/lib/graph/graphScale";
import { buildPedigreeConnectorSegments } from "../../shared/pedigreeConnectors";

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
  const pinchBaseRef = useRef(scale);

  const setScale = useCallback(
    (next: number) => {
      const clamped = clampGraphScale(next);
      if (onZoomChange) onZoomChange(clamped);
      else setInternalScale(clamped);
    },
    [onZoomChange],
  );

  pinchBaseRef.current = scale;

  const applyPinchScale = useCallback(
    (factor: number) => {
      setScale(pinchBaseRef.current * factor);
    },
    [setScale],
  );

  const onPinchBegin = useCallback(() => {
    pinchBaseRef.current = scale;
  }, [scale]);

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(onPinchBegin)();
    })
    .onUpdate((e) => {
      runOnJS(applyPinchScale)(e.scale);
    });

  const scrollGesture = Gesture.Native();
  const composed = Gesture.Simultaneous(pinch, scrollGesture);

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

  const connectorSegments = useMemo(() => {
    const boxes = graph.nodes.map((n) => ({
      id: n.id,
      x: n.position.x - layout.minX + PADDING,
      y: n.position.y - layout.minY + PADDING,
      width: NODE_W,
      height: NODE_H,
    }));
    return buildPedigreeConnectorSegments(boxes, graph.edges);
  }, [graph.nodes, graph.edges, layout.minX, layout.minY]);

  const scaledW = layout.width * scale;
  const scaledH = layout.height * scale;

  return (
    <GestureDetector gesture={composed}>
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
              {connectorSegments.map((s) => {
                const stroke =
                  s.kind === "spouse"
                    ? theme.colors.secondary
                    : theme.colors.primary;
                return (
                  <Line
                    key={s.id}
                    x1={s.x1}
                    y1={s.y1}
                    x2={s.x2}
                    y2={s.y2}
                    stroke={stroke}
                    strokeWidth={s.kind === "spouse" ? 2.5 : 2}
                    strokeOpacity={0.7}
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
              const isPrivate = p.treeDisplayIsPrivate === true;
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
                      name={isPrivate ? "lock" : genderIcon(p.gender)}
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text
                      variant="labelLarge"
                      numberOfLines={2}
                      style={{ color: theme.colors.onSurface, flex: 1 }}
                    >
                      {isPrivate ? copy.tree.privatePerson : formatGraphPersonName(p)}
                    </Text>
                  </View>
                  {!isPrivate && (
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                    >
                      {p.familyCode}
                    </Text>
                  )}
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
