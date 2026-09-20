import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { apiEatingOut } from '../../utils/apiClient';
import { EatingOutResponse } from '../../types/api';
import { Button, Chip, LoadingState, ErrorState, InlineError } from '../../components/UI';
import { getGuardrailError } from '../../utils/guardrails';
import { AdBanner } from '../../components/AdBanner';
import { useAdsInitialized } from '../../../App';

const CUISINES = [
  'Burger', 'Pizza', 'Sushi / Japanese', 'Chinese', 'Indian', 'Thai',
  'Mexican', 'Italian', 'Mediterranean', 'Fast food', 'Cafe', 'Other',
];
const OCCASIONS = ['Lunch out', 'Dinner date', 'Work lunch', 'Quick bite', 'Group meal'];

export default function EatingOutScreen() {
  const adsInitialized = useAdsInitialized();
  const [food, setFood] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuardrailError, setIsGuardrailError] = useState(false);
  const [result, setResult] = useState<EatingOutResponse | null>(null);

  function clearError() {
    setError(null);
    setIsGuardrailError(false);
  }

  async function handleBuild() {
    const target = food.trim() || cuisine;
    if (!target) return;

    const guardrailMsg = getGuardrailError(target, 'eatingOut');
    if (guardrailMsg) {
      setError(guardrailMsg);
      setIsGuardrailError(true);
      return;
    }

    setLoading(true);
    clearError();
    try {
      const data = await apiEatingOut({ food: target, cuisine: cuisine || undefined, occasion: occasion || undefined });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState message={`Building your meal around ${food || cuisine}…`} />;
  }

  if (result) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.mainFoodCard}>
          <Text style={styles.mainFoodLabel}>You're having</Text>
          <Text style={styles.mainFoodName}>{result.mainFood} 🍽️</Text>
          <Text style={styles.affirmation}>{result.affirmation}</Text>
        </View>

        {error && <ErrorState message={error} onRetry={handleBuild} />}

        <Text style={styles.pairingsLabel}>Optional pairings</Text>
        <Text style={styles.pairingsNote}>All optional. Take what sounds good.</Text>

        {result.pairings.map((p, i) => (
          <View key={i} style={styles.pairingCard}>
            <View style={styles.pairingRow}>
              <Text style={styles.pairingEmoji}>🤝</Text>
              <View style={styles.pairingBody}>
                <Text style={styles.pairingTitle}>{p.pairing}</Text>
                <Text style={styles.pairingReason}>{p.reasoning}</Text>
              </View>
            </View>
          </View>
        ))}

        <Button label="Try different food" onPress={() => { setResult(null); setFood(''); setCuisine(''); clearError(); }} variant="ghost" style={styles.resetBtn} />
        <AdBanner slot="bannerEatingOut" adsInitialized={adsInitialized} />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Eating Out</Text>
      <Text style={styles.subheading}>
        Keep what you want to eat. Gemini will suggest optional pairings tailored to your preferences.
      </Text>

      <Text style={styles.fieldLabel}>What are you planning to eat?</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="restaurant-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.input}
          placeholder="e.g. burger, pizza, sushi..."
          placeholderTextColor={Colors.textLight}
          value={food}
          onChangeText={(v) => { setFood(v); if (isGuardrailError) clearError(); }}
          returnKeyType="done"
          accessibilityLabel="Food you're eating"
        />
      </View>

      {error && (
        isGuardrailError
          ? <InlineError message={error} />
          : <ErrorState message={error} onRetry={handleBuild} />
      )}

      <Text style={styles.fieldLabel}>Or pick a cuisine</Text>
      <View style={styles.chipRow}>
        {CUISINES.map((c) => (
          <Chip key={c} label={c} selected={cuisine === c}
            onPress={() => { setCuisine(c); if (!food) setFood(c); }} />
        ))}
      </View>

      <Text style={styles.fieldLabel}>Occasion (optional)</Text>
      <View style={styles.chipRow}>
        {OCCASIONS.map((o) => (
          <Chip key={o} label={o} selected={occasion === o} onPress={() => setOccasion(o === occasion ? '' : o)} />
        ))}
      </View>

      <View style={styles.noteRow}>
        <Ionicons name="heart-outline" size={16} color={Colors.primary} />
        <Text style={styles.noteText}>No calorie-based ranking. No restaurant shaming. Suggestions are 100% optional.</Text>
      </View>

      <Button label="Build my meal →" onPress={handleBuild} disabled={!food.trim() && !cuisine} style={styles.cta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: Typography.fontSize2XL, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.sm },
  subheading: { fontSize: Typography.fontSizeMD, color: Colors.textMuted, lineHeight: 22, marginBottom: Spacing.lg },
  fieldLabel: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightSemiBold, color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radii.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 12, marginBottom: Spacing.lg },
  input: { flex: 1, fontSize: Typography.fontSizeMD, color: Colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.primaryLight, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg },
  noteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.primary, lineHeight: 20 },
  cta: { marginBottom: Spacing.sm },
  mainFoodCard: { backgroundColor: Colors.primary, borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  mainFoodLabel: { fontSize: Typography.fontSizeSM, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  mainFoodName: { fontSize: Typography.fontSize3XL, fontWeight: Typography.fontWeightBold, color: Colors.white, marginBottom: 8 },
  affirmation: { fontSize: Typography.fontSizeMD, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  pairingsLabel: { fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: 4 },
  pairingsNote: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, marginBottom: Spacing.md },
  pairingCard: { backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  pairingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  pairingEmoji: { fontSize: 20, marginTop: 2 },
  pairingBody: { flex: 1 },
  pairingTitle: { fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemiBold, color: Colors.text, marginBottom: 4 },
  pairingReason: { fontSize: Typography.fontSizeSM, color: Colors.textMuted, lineHeight: 18 },
  resetBtn: { marginTop: Spacing.md },
});
