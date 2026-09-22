import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Line } from "react-native-svg";
import { Text, useTheme } from "react-native-paper";

import type { FamilyGraph } from "@/lib/graph/types";

const NODE_W = 148;
const NODE_H = 76;
const PADDING = 24;

type FamilyTreeGraphViewProps = {
  graph: FamilyGraph;
};

export function FamilyTreeGraphView({ graph }: FamilyTreeGraphViewProps) {
  const theme = useTheme();
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();

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
    return {
      minX,
      minY,
      width: Math.max(screenW, maxX - minX + PADDING * 2),
      height: maxY - minY + PADDING * 2 + 40,
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

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      style={styles.hScroll}
      contentContainerStyle={{ minWidth: layout.width }}
    >
      <ScrollView
        nestedScrollEnabled
        contentContainerStyle={{
          width: layout.width,
          minHeight: layout.height,
        }}
      >
        <View style={{ width: layout.width, height: layout.height }}>
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
            return (
              <Pressable
                key={n.id}
                onPress={() =>
                  router.push({
                    pathname: "/member/[personId]",
                    params: { personId: p.id, code: p.familyCode },
                  })
                }
                style={[
                  styles.node,
                  {
                    left,
                    top,
                    backgroundColor: theme.colors.surface,
                    borderColor: focal ? theme.colors.primary : theme.colors.outline,
                    borderWidth: focal ? 2 : 1,
                  },
                ]}
              >
                <Text
                  variant="labelLarge"
                  numberOfLines={2}
                  style={{ color: theme.colors.onSurface }}
                >
                  {p.firstName} {p.lastName}
                </Text>
                <Text
                  variant="labelSmall"
                  style={{ color: theme.colors.primary, marginTop: 2 }}
                >
                  {p.familyCode}
                </Text>
                {p.currentCity ? (
                  <Text
                    variant="labelSmall"
                    numberOfLines={1}
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {p.currentCity}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
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
});
