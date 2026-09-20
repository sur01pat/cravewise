import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { HungerLevel, MealContext, TimeAvailable, EffortLevel, CravingType } from '../../types';
import { apiHungryNow } from '../../utils/apiClient';
import { HungryNowSuggestion } from '../../types/api';
import { Button, Chip, LoadingState, ErrorState } from '../../components/UI';
import { AdBanner } from '../../components/AdBanner';
import { useAdsInitialized } from '../../../App';
import { Ionicons } from '@expo/vector-icons';

const HUNGER_LEVELS: HungerLevel[] = ['a little hungry', 'hungry', 'very hungry'];
const CONTEXTS: MealContext[] = ['breakfast', 'lunch', 'dinner', 'snack', 'late-night'];
const TIMES: TimeAvailable[] = ['2 minutes', '5 minutes', '15+ minutes'];
const EFFORTS: EffortLevel[] = ['no-cook', 'minimal effort', 'willing to cook'];
const CRAVINGS: CravingType[] = ['sweet', 'salty', 'crunchy', 'creamy', 'warm', 'cold', 'comfort food'];
const STEP_LABELS = ['How hungry?', 'When?', 'Time?', 'Effort?', 'Craving?'];

interface Inputs {
  hungerLevel: HungerLevel | null;
  context: MealContext | null;
  timeAvailable: TimeAvailable | null;
  effort: EffortLevel | null;
  cravings: CravingType[];
}

export default function HungryNowScreen() {
  const adsInitialized = useAdsInitialized();
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<Inputs>({
    hungerLevel: null,
    context: null,
    timeAvailable: null,
    effort: null,
    cravings: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ suggestions: HungryNowSuggestion[]; contextNote: string } | null>(null);

  function toggleCraving(c: CravingType) {
    setInputs((prev) => ({
      ...prev,
      cravings: prev.cravings.includes(c)
        ? prev.cravings.filter((x) => x !== c)
        : [...prev.cravings, c],
    }));
  }

  async function handleGenerate() {
    if (!inputs.hungerLevel || !inputs.context || !inputs.timeAvailable || !inputs.effort) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiHungryNow({
        hungerLevel: inputs.hungerLevel,
        context: inputs.context,
        timeAvailable: inputs.timeAvailable,
        effort: inputs.effort,
        cravings: inputs.cravings,
      });
      setResult(data);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setInputs({ hungerLevel: null, context: null, timeAvailable: null, effort: null, cravings: [] });
    setResult(null);
    setError(null);
    setStep(0);
  }

  // Loading
  if (loading) {
    return <LoadingState message="Finding the right ideas for you…" />;
  }

  // Results view
  if (result) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Here are some ideas 🍴</Text>
        <Text style={styles.subheading}>{result.contextNote}</Text>

        {result.suggestions.map((r, i) => (
          <View key={i} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>{r.title}</Text>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.timeBadgeText}>{r.time}</Text>
              </View>
            </View>
            <Text style={styles.resultDesc}>{r.description}</Text>
            <Text style={styles.whyText}>{r.whyItWorks}</Text>
            <View style={styles.effortBadge}>
              <Text style={styles.effortText}>{r.effort}</Text>
            </View>
          </View>
        ))}

        <Button label="Give me another idea" onPress={handleReset} variant="secondary" style={styles.ctaBtn} />
        <Button label="Start over" onPress={handleReset} variant="ghost" style={styles.ctaBtn} />
        <AdBanner slot="bannerHungry" adsInitialized={adsInitialized} />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  // Error view
  if (error) {
    return (
      <View style={styles.root}>
        <ErrorState message={error} onRetry={handleGenerate} />
        <Button label="Start over" onPress={handleReset} variant="ghost" style={{ margin: Spacing.md }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Step progress */}
      <View style={styles.progressRow}>
        {STEP_LABELS.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <>
            <Text style={styles.question}>How hungry are you right now?</Text>
            {HUNGER_LEVELS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.optionCard, inputs.hungerLevel === h && styles.optionCardSelected]}
                onPress={() => { setInputs((p) => ({ ...p, hungerLevel: h })); setStep(1); }}
                accessibilityLabel={h}
              >
                <Text style={styles.optionEmoji}>
                  {h === 'a little hungry' ? '😐' : h === 'hungry' ? '😋' : '🤤'}
                </Text>
                <Text style={[styles.optionText, inputs.hungerLevel === h && styles.optionTextSelected]}>
                  {h.charAt(0).toUpperCase() + h.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.question}>What kind of meal is this?</Text>
            <View style={styles.chipGroup}>
              {CONTEXTS.map((c) => (
                <Chip key={c} label={c.charAt(0).toUpperCase() + c.slice(1)} selected={inputs.context === c}
                  onPress={() => { setInputs((p) => ({ ...p, context: c })); setStep(2); }} />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.question}>How much time do you have?</Text>
            {TIMES.map((t) => (
              <TouchableOpacity key={t}
                style={[styles.optionCard, inputs.timeAvailable === t && styles.optionCardSelected]}
                onPress={() => { setInputs((p) => ({ ...p, timeAvailable: t })); setStep(3); }}
                accessibilityLabel={t}
              >
                <Ionicons name="timer-outline" size={20} color={Colors.textMuted} />
                <Text style={[styles.optionText, inputs.timeAvailable === t && styles.optionTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.question}>How much effort do you want to put in?</Text>
            {EFFORTS.map((e) => (
              <TouchableOpacity key={e}
                style={[styles.optionCard, inputs.effort === e && styles.optionCardSelected]}
                onPress={() => { setInputs((p) => ({ ...p, effort: e })); setStep(4); }}
                accessibilityLabel={e}
              >
                <Text style={[styles.optionText, inputs.effort === e && styles.optionTextSelected]}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.question}>Any cravings? (pick all that apply)</Text>
            <View style={styles.chipGroup}>
              {CRAVINGS.map((c) => (
                <Chip key={c} label={c.charAt(0).toUpperCase() + c.slice(1)}
                  selected={inputs.cravings.includes(c)} onPress={() => toggleCraving(c)} />
              ))}
            </View>
            <Button label="Show me personalised ideas →" onPress={handleGenerate} style={styles.ctaBtn} />
            <Button label="Skip — surprise me" onPress={handleGenerate} variant="ghost" style={styles.ctaBtn} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  progressRow: { flexDirection: 'row', gap: 6, padding: Spacing.md, paddingBottom: 0 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.primary },
  question: {
    fontSize: Typography.fontSize2XL, fontWeight: Typography.fontWeightBold,
    color: Colors.text, marginBottom: Spacing.lg, lineHeight: 32,
  },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surface, borderRadius: Radii.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadows.sm,
  },
  optionCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionEmoji: { fontSize: 24 },
  optionText: { fontSize: Typography.fontSizeLG, color: Colors.text, fontWeight: Typography.fontWeightMedium },
  optionTextSelected: { color: Colors.primary, fontWeight: Typography.fontWeightBold },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  ctaBtn: { marginBottom: Spacing.sm },
  heading: { fontSize: Typography.fontSize2XL, fontWeight: Typography.fontWeightBold, color: Colors.text, marginBottom: Spacing.sm },
  subheading: { fontSize: Typography.fontSizeMD, color: Colors.textMuted, marginBottom: Spacing.lg, lineHeight: 22 },
  resultCard: { backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  resultTitle: { flex: 1, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold, color: Colors.text, marginRight: Spacing.sm },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceAlt, borderRadius: Radii.sm, paddingHorizontal: 8, paddingVertical: 4 },
  timeBadgeText: { fontSize: Typography.fontSizeXS, color: Colors.textMuted },
  resultDesc: { fontSize: Typography.fontSizeMD, color: Colors.textMuted, lineHeight: 22, marginBottom: 6 },
  whyText: { fontSize: Typography.fontSizeSM, color: Colors.secondary, lineHeight: 18, marginBottom: Spacing.sm, fontStyle: 'italic' },
  effortBadge: { alignSelf: 'flex-start', backgroundColor: Colors.secondaryLight, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  effortText: { fontSize: Typography.fontSizeXS, color: Colors.secondary, fontWeight: Typography.fontWeightSemiBold },
});
