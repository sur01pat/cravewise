import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { PantryItem } from '../../types';
import { PantryMeal } from '../../types/api';
import { apiPantryMeals } from '../../utils/apiClient';
import { loadPantry, savePantry } from '../../store/storage';
import { Button, LoadingState, ErrorState, InlineError } from '../../components/UI';
import { getGuardrailError } from '../../utils/guardrails';
import { AdBanner } from '../../components/AdBanner';
import { useAdsInitialized } from '../../../App';

const QUICK_ITEMS = [
  'Eggs', 'Rice', 'Bread', 'Pasta', 'Cheese', 'Tuna',
  'Yogurt', 'Avocado', 'Peanut butter', 'Lentils', 'Oats', 'Banana',
];

export default function WhatIHaveScreen() {
  const adsInitialized = useAdsInitialized();
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ meals: PantryMeal[]; missingComponentNote?: string } | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    loadPantry().then(setPantry);
  }, []);

  async function addItem(name: string) {
    if (!name.trim()) return;
    const guardrailError = getGuardrailError(name, 'pantryItem');
    if (guardrailError) {
      setItemError(guardrailError);
      return;
    }
    setItemError(null);
    const item: PantryItem = { id: Date.now().toString(), name: name.trim() };
    const updated = [...pantry, item];
    setPantry(updated);
    await savePantry(updated);
    setNewItem('');
    setResult(null);
  }

  async function removeItem(id: string) {
    const updated = pantry.filter((i) => i.id !== id);
    setPantry(updated);
    await savePantry(updated);
    setResult(null);
  }

  async function handleGenerate() {
    if (pantry.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiPantryMeals(pantry.map((i) => i.name));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState message="Finding meal ideas from your pantry…" />;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>What do you have?</Text>
      <Text style={styles.subheading}>
        Add your ingredients — Gemini will suggest personalised meals that match your diet, skill level and preferences.
      </Text>

      {error && <ErrorState message={error} onRetry={handleGenerate} />}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add an ingredient..."
          placeholderTextColor={Colors.textLight}
          value={newItem}
          onChangeText={(v) => { setNewItem(v); if (itemError) setItemError(null); }}
          onSubmitEditing={() => addItem(newItem)}
          returnKeyType="done"
          accessibilityLabel="Add ingredient"
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => addItem(newItem)} accessibilityLabel="Add item">
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {itemError && <InlineError message={itemError} />}

      {/* Quick chips */}
      <Text style={styles.quickLabel}>Common items</Text>
      <View style={styles.quickRow}>
        {QUICK_ITEMS.filter((q) => !pantry.find((p) => p.name.toLowerCase() === q.toLowerCase())).map((q) => (
          <TouchableOpacity key={q} style={styles.quickChip} onPress={() => addItem(q)} accessibilityLabel={`Add ${q}`}>
            <Ionicons name="add-circle-outline" size={14} color={Colors.secondary} />
            <Text style={styles.quickChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pantry list */}
      {pantry.length > 0 && (
        <>
          <Text style={styles.pantryLabel}>In your pantry ({pantry.length})</Text>
          <View style={styles.pantryList}>
            {pantry.map((item) => (
              <View key={item.id} style={styles.pantryItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                <Text style={styles.pantryItemText}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeItem(item.id)} accessibilityLabel={`Remove ${item.name}`}>
                  <Ionicons name="close" size={18} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Button label="What can I make with this?" onPress={handleGenerate} style={styles.cta} />
        </>
      )}

      {/* Results */}
      {result && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsHeading}>Meal ideas from your pantry</Text>
          {result.missingComponentNote && (
            <View style={styles.noteRow}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.secondary} />
              <Text style={styles.noteText}>{result.missingComponentNote}</Text>
            </View>
          )}
          {result.meals.map((m, i) => (
            <View key={i} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{m.title}</Text>
                <View style={styles.mealBadges}>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.timeBadgeText}>{m.prepTime}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.mealDesc}>{m.description}</Text>
              <Text style={styles.whyText}>{m.whyItWorks}</Text>
              <View style={styles.usesRow}>
                {m.usesIngredients.slice(0, 4).map((ing) => (
                  <View key={ing} style={styles.ingBadge}>
                    <Text style={styles.ingText}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <AdBanner slot="bannerPantry" adsInitialized={adsInitialized} />
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: Typography.fontSize2XL, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.sm },
  subheading: { fontSize: Typography.fontSizeMD, color: Colors.textMuted, lineHeight: 22, marginBottom: Spacing.lg },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  input: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radii.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    fontSize: Typography.fontSizeMD, color: Colors.text,
  },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radii.lg, width: 50, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemiBold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  quickChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: Radii.full, backgroundColor: Colors.secondaryLight, borderWidth: 1, borderColor: Colors.secondary },
  quickChipText: { fontSize: Typography.fontSizeSM, color: Colors.secondary },
  pantryLabel: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemiBold, color: Colors.text, marginBottom: Spacing.sm },
  pantryList: { backgroundColor: Colors.surface, borderRadius: Radii.lg, marginBottom: Spacing.md, overflow: 'hidden' },
  pantryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  pantryItemText: { flex: 1, fontSize: Typography.fontSizeMD, color: Colors.text },
  cta: { marginBottom: Spacing.lg },
  resultsSection: { marginTop: Spacing.sm },
  resultsHeading: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.sm },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.secondaryLight, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md },
  noteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.secondary, lineHeight: 18 },
  mealCard: { backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  mealTitle: { flex: 1, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginRight: Spacing.sm },
  mealBadges: { flexDirection: 'row', gap: 6 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radii.sm, paddingHorizontal: 8, paddingVertical: 4 },
  timeBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  mealDesc: { fontSize: Typography.fontSizeMD, color: Colors.textMuted, lineHeight: 22, marginBottom: 6 },
  whyText: { fontSize: Typography.fontSizeSM, color: Colors.secondary, lineHeight: 18, marginBottom: Spacing.sm, fontStyle: 'italic' },
  usesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ingBadge: { backgroundColor: Colors.secondaryLight, borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  ingText: { fontSize: Typography.fontSizeXS, color: Colors.secondary },
});
