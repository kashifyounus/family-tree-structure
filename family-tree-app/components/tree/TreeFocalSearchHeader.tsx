import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
import { FormTextInput } from "@/components/ui/FormTextInput";
import { IconButton } from "@/components/ui/IconButton";
import { copy } from "@/content/businessCopy";
import { listLocalMembers } from "@/lib/db/localRepository";
import { formatBilingualName } from "@/lib/format/displayName";
import { memberRecordSubtitle } from "@/lib/members/memberPickerSubtitle";

type TreeFocalSearchHeaderProps = {
  titleEn: string;
  titleUr?: string | null;
  style?: ViewStyle;
  onOpenMenu: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSelectFamilyCode: (familyCode: string) => void;
  searchEnabled?: boolean;
};

export function TreeFocalSearchHeader({
  titleEn,
  titleUr,
  style,
  onOpenMenu,
  onZoomIn,
  onZoomOut,
  onSelectFamilyCode,
  searchEnabled = true,
}: TreeFocalSearchHeaderProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!searchEnabled || !focused) return [];
    const q = query.trim();
    if (q.length < 1) return [];
    return listLocalMembers(q).slice(0, 12);
  }, [query, focused, searchEnabled]);

  const showDropdown = searchEnabled && focused && query.trim().length > 0;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <AppText variant="titleSmall" numberOfLines={1} style={styles.titleEn}>
            {titleEn}
          </AppText>
          {titleUr ? (
            <AppText variant="labelSmall" numberOfLines={1} style={styles.titleUr}>
              {titleUr}
            </AppText>
          ) : null}
        </View>
        <IconButton
          icon="filter-variant"
          accessibilityLabel="Filter tree"
          onPress={onOpenMenu}
        />
        <IconButton
          icon="magnify-plus-outline"
          accessibilityLabel={copy.tree.zoomIn}
          onPress={onZoomIn}
        />
        <IconButton
          icon="magnify-minus-outline"
          accessibilityLabel={copy.tree.zoomOut}
          onPress={onZoomOut}
        />
        <IconButton
          testID="tree-overflow-menu"
          icon="dots-vertical"
          accessibilityLabel={copy.tree.options}
          onPress={onOpenMenu}
        />
      </View>
      {searchEnabled ? (
        <FormTextInput
          label={copy.tree.searchMembers}
          placeholder={copy.tree.searchMembersPlaceholder}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID="tree-member-search"
        />
      ) : null}
      {showDropdown ? (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(m) => m.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.resultRow}
                onPress={() => {
                  setQuery("");
                  setFocused(false);
                  onSelectFamilyCode(item.familyCode);
                }}
              >
                <AppText variant="bodyMedium" numberOfLines={1}>
                  {formatBilingualName(item) || `${item.firstName} ${item.lastName}`}
                </AppText>
                <AppText variant="labelSmall" style={styles.resultSub} numberOfLines={1}>
                  {memberRecordSubtitle(item)}
                </AppText>
              </Pressable>
            )}
            ListEmptyComponent={
              <AppText variant="bodySmall" style={styles.empty}>
                {copy.tree.searchNoResults}
              </AppText>
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleBlock: { flex: 1, marginLeft: 4, minWidth: 0 },
  titleEn: { color: "#1B4332", fontWeight: "600" },
  titleUr: { color: "#6b7280", marginTop: 1 },
  dropdown: {
    maxHeight: 220,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(27, 67, 50, 0.12)",
    backgroundColor: "#FFFDF8",
  },
  resultRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(27, 67, 50, 0.08)",
  },
  resultSub: { color: "#6b7280", marginTop: 2 },
  empty: { padding: 12, color: "#6b7280" },
});
