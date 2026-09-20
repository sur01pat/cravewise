import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { HomeStackParamList } from '../../types';
import { apiRecommend } from '../../utils/apiClient';
import { Button, LoadingState, ErrorState, InlineError } from '../../components/UI';
import { getGuardrailError } from '../../utils/guardrails';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Eating'>;

const QUICK_EXAMPLES = [
  'Instant noodles', 'Toast and coffee', 'Dal rice', 'Cereal with milk',
  'Avocado toast', 'Burger and fries', 'Pizza slice', 'PB sandwich',
];

export default function EatingScreen() {
  const navigation = useNavigation<Nav>();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuardrailError, setIsGuardrailError] = useState(false);

  function clearError() {
    setError(null);
    setIsGuardrailError(false);
  }

  async function handleAnalyse() {
    const meal = text.trim();
    if (!meal) return;

    const guardrailMsg = getGuardrailError(meal, 'eating');
    if (guardrailMsg) {
      setError(guardrailMsg);
      setIsGuardrailError(true);
      return;
    }

    setLoading(true);
    clearError();
    try {
      const result = await apiRecommend(meal);
      // Map API response to the navigation param shape (same shape — direct pass)
      navigation.navigate('RecommendationResult', {
        result: {
          mealDescription: result.mealDescription,
          detectedComponents: result.detectedComponents,
          missingComponents: result.missingComponents,
          suggestions: result.suggestions,
          explanation: result.explanation,
        },
        mealDescription: meal,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the CraveWise service. Please check your connection.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <LoadingState message={`Analysing "${text.slice(0, 30)}${text.length > 30 ? '…' : ''}"…`} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>What are you eating?</Text>
        <Text style={styles.subheading}>
          Type anything — Gemini will look at what's already there before suggesting anything new.
        </Text>

        {error && (
          isGuardrailError
            ? <InlineError message={error} />
            : <ErrorState message={error} onRetry={handleAnalyse} />
        )}

        <View style={styles.inputWrapper}>
          <Ionicons name="restaurant-outline" size={20} color={Colors.textLight} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. instant noodles, dal rice, toast..."
            placeholderTextColor={Colors.textLight}
            value={text}
            onChangeText={(v) => { setText(v); if (isGuardrailError) clearError(); }}
            multiline
            returnKeyType="done"
            accessibilityLabel="Meal description"
          />
          {text.length > 0 && (
            <TouchableOpacity onPress={() => { setText(''); clearError(); }} accessibilityLabel="Clear input">
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.examplesLabel}>Quick picks</Text>
        <View style={styles.examplesRow}>
          {QUICK_EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex}
              style={[styles.exampleChip, text === ex && styles.exampleChipSelected]}
              onPress={() => setText(ex)}
              accessibilityLabel={ex}
            >
              <Text style={[styles.exampleText, text === ex && styles.exampleTextSelected]}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="sparkles-outline" size={18} color={Colors.secondary} />
          <Text style={styles.noteText}>
            Personalised suggestions powered by Gemini — tailored to your dietary preferences, allergies and pantry.
          </Text>
        </View>

        <Button
          label={text.trim() ? `Analyse "${text.trim().slice(0, 20)}${text.length > 20 ? '…' : ''}"` : 'Analyse my meal'}
          onPress={handleAnalyse}
          disabled={!text.trim()}
          style={styles.cta}
        />

        <TouchableOpacity
          style={styles.keepAsIs}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Keep meal as is"
        >
          <Text style={styles.keepAsIsText}>Keep it as is — it's fine 👍</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  heading: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  inputIcon: { marginRight: Spacing.sm, marginTop: 2 },
  input: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  examplesLabel: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  exampleChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exampleChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  exampleText: { fontSize: Typography.fontSizeSM, color: Colors.textMuted },
  exampleTextSelected: { color: Colors.primary, fontWeight: Typography.fontWeightSemiBold },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noteText: { flex: 1, fontSize: Typography.fontSizeSM, color: Colors.secondary, lineHeight: 20 },
  cta: { marginBottom: Spacing.md },
  keepAsIs: { alignItems: 'center', paddingVertical: Spacing.sm },
  keepAsIsText: { fontSize: Typography.fontSizeMD, color: Colors.textMuted },
});
