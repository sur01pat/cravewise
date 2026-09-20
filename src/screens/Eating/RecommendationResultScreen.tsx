import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { HomeStackParamList, Suggestion, SavedCombination } from '../../types';
import { Button } from '../../components/UI';
import { AdBanner } from '../../components/AdBanner';
import { useAdsInitialized } from '../../../App';
import { saveCombination } from '../../store/storage';

type RouteT = RouteProp<HomeStackParamList, 'RecommendationResult'>;

const COMPONENT_LABELS: Record<string, string> = {
  carbohydrate: '🌾 Carbs',
  protein: '💪 Protein',
  fat: '🥑 Fat',
  fibre: '🥦 Fibre',
  produce: '🥗 Produce',
  volume: '💧 Volume',
};

const CATEGORY_ICON: Record<string, string> = {
  addition: '➕',
  swap: '🔄',
  pairing: '🤝',
};

export default function RecommendationResultScreen() {
  const adsInitialized = useAdsInitialized();
  const navigation = useNavigation();
  const route = useRoute<RouteT>();
  const { result, mealDescription } = route.params;
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function toggleSuggestion(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    const combo: SavedCombination = {
      id: Date.now().toString(),
      name: mealDescription,
      mealDescription,
      suggestions: result.suggestions.filter((s) => selected.includes(s.id)),
      savedAt: Date.now(),
      tags: result.detectedComponents,
    };
    await saveCombination(combo);
    setSaved(true);
    Alert.alert('Saved!', `"${mealDescription}" has been saved to your combinations.`);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Meal heading */}
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{mealDescription}</Text>
        <Text style={styles.explanation}>{result.explanation}</Text>
      </View>

      {/* Detected components */}
      {result.detectedComponents.length > 0 && (
        <View style={styles.componentsRow}>
          {result.detectedComponents.map((c) => (
            <View key={c} style={styles.componentBadge}>
              <Text style={styles.componentText}>{COMPONENT_LABELS[c] ?? c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions */}
      <Text style={styles.suggestionsLabel}>Optional additions</Text>
      <Text style={styles.suggestionsNote}>
        Pick what sounds good — or skip them all. There's no wrong answer.
      </Text>

      {result.suggestions.map((suggestion: Suggestion) => {
        const isSelected = selected.includes(suggestion.id);
        return (
          <TouchableOpacity
            key={suggestion.id}
            style={[styles.suggestionCard, isSelected && styles.suggestionCardSelected]}
            onPress={() => toggleSuggestion(suggestion.id)}
            activeOpacity={0.8}
            accessibilityLabel={suggestion.text}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected }}
          >
            <View style={styles.suggestionRow}>
              <View style={[styles.checkBox, isSelected && styles.checkBoxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color={Colors.white} />}
              </View>
              <View style={styles.suggestionBody}>
                <View style={styles.suggestionTitleRow}>
                  <Text style={styles.categoryIcon}>
                    {CATEGORY_ICON[suggestion.category] ?? '➕'}
                  </Text>
                  <Text style={[styles.suggestionText, isSelected && styles.suggestionTextSelected]}>
                    {suggestion.text}
                  </Text>
                </View>
                <Text style={styles.reasoningText}>{suggestion.reasoning}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Keep as is */}
      <TouchableOpacity
        style={styles.keepAsIs}
        onPress={() => { setSelected([]); navigation.goBack(); }}
        accessibilityLabel="Keep meal as is"
      >
        <Ionicons name="thumbs-up-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.keepAsIsText}>Keep it as is — it looks great</Text>
      </TouchableOpacity>

      {/* Try another / Save */}
      <View style={styles.actions}>
        <Button
          label="Try another idea"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={styles.actionBtn}
        />
        <Button
          label={saved ? '✓ Saved' : 'Save combination'}
          onPress={handleSave}
          disabled={saved}
          style={styles.actionBtn}
        />
      </View>

      <AdBanner slot="bannerResult" adsInitialized={adsInitialized} />
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  mealHeader: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  mealName: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  explanation: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  componentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  componentBadge: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radii.full,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  componentText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.secondary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  suggestionsLabel: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: 4,
  },
  suggestionsNote: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  suggestionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  suggestionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkBoxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  suggestionBody: { flex: 1 },
  suggestionTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  categoryIcon: { fontSize: 16 },
  suggestionText: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.text,
    lineHeight: 22,
  },
  suggestionTextSelected: { color: Colors.primary },
  reasoningText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  keepAsIs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
  },
  keepAsIsText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: { flex: 1 },
  footer: { height: Spacing.md },
});
