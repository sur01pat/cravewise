import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { SavedCombination, RootTabParamList } from '../../types';
import { loadSaved, deleteCombination } from '../../store/storage';
import { EmptyState, LoadingState } from '../../components/UI';
import { apiRecommend } from '../../utils/apiClient';

type Nav = NavigationProp<RootTabParamList>;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function SavedScreen() {
  const navigation = useNavigation<Nav>();
  const [saved, setSaved] = useState<SavedCombination[]>([]);
  const [reusingId, setReusingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadSaved().then(setSaved);
    }, []),
  );

  async function handleUseAgain(combo: SavedCombination) {
    setReusingId(combo.id);
    try {
      // Re-run through Gemini so suggestions are always fresh and personalised
      const result = await apiRecommend(combo.mealDescription);
      // Navigate: switch to Home tab → push RecommendationResult onto its stack
      navigation.navigate('Home', {
        screen: 'RecommendationResult',
        params: { result, mealDescription: combo.mealDescription },
      });
    } catch (err) {
      // If the API is unreachable, fall back to the saved suggestions
      navigation.navigate('Home', {
        screen: 'RecommendationResult',
        params: {
          result: {
            mealDescription: combo.mealDescription,
            detectedComponents: [],
            missingComponents: [],
            explanation: `Here's your saved combination for "${combo.mealDescription}".`,
            suggestions: combo.suggestions,
          },
          mealDescription: combo.mealDescription,
        },
      });
    } finally {
      setReusingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    Alert.alert(
      'Remove combination',
      `Remove "${name}" from your saved combinations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteCombination(id);
            setSaved((prev) => prev.filter((c) => c.id !== id));
          },
        },
      ],
    );
  }

  if (saved.length === 0) {
    return (
      <View style={styles.root}>
        <Text style={styles.screenTitle}>Saved Combinations</Text>
        <EmptyState
          emoji="🔖"
          title="Nothing saved yet"
          message="When you find a combination you love, save it here for one-tap reuse."
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.screenTitle}>Saved Combinations</Text>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isLoading = reusingId === item.id;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cardActions}>
                  <Text style={styles.cardDate}>{formatDate(item.savedAt)}</Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    accessibilityLabel={`Delete ${item.name}`}
                    style={styles.deleteBtn}
                    disabled={isLoading}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
              </View>

              {item.suggestions.length > 0 ? (
                <>
                  <Text style={styles.withLabel}>With</Text>
                  {item.suggestions.map((s) => (
                    <View key={s.id} style={styles.additionRow}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                      <Text style={styles.additionText}>{s.text}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles.keptText}>Kept as is — no additions</Text>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {item.tags.slice(0, 3).map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* One-tap reuse — calls Gemini for fresh suggestions */}
              <TouchableOpacity
                style={[styles.reuseBtn, isLoading && styles.reuseBtnLoading]}
                onPress={() => handleUseAgain(item)}
                disabled={isLoading || reusingId !== null}
                accessibilityLabel={`Use ${item.name} again`}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <>
                    <Ionicons name="hourglass-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.reuseBtnTextLoading}>Getting fresh ideas…</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
                    <Text style={styles.reuseBtnText}>Use again</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  screenTitle: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardName: {
    flex: 1,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardDate: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textLight,
  },
  deleteBtn: { padding: 4 },
  withLabel: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  additionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  additionText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.text,
  },
  keptText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
  },
  reuseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  reuseBtnLoading: {
    opacity: 0.6,
  },
  reuseBtnText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  reuseBtnTextLoading: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
  },
});
