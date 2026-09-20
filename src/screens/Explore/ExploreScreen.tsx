import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { apiExploreCards } from '../../utils/apiClient';
import { ExploreCard } from '../../types/api';
import { loadSaved } from '../../store/storage';
import { LoadingState, ErrorState } from '../../components/UI';

export default function ExploreScreen() {
  const [cards, setCards] = useState<ExploreCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pass recent meal names for contextualisation
      const saved = await loadSaved();
      const recentMeals = saved.slice(0, 8).map((s) => s.name);
      const data = await apiExploreCards(recentMeals.length > 0 ? recentMeals : undefined);
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load content. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh cards every time the tab is focused so content stays fresh
  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [fetchCards]),
  );

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  const cardColor: Record<ExploreCard['category'], { bg: string; border: string }> = {
    'hunger-crushing-combo': { bg: Colors.primaryLight, border: Colors.primary },
    'myth-vs-reality': { bg: '#FEF9E8', border: '#C0851A' },
    'real-life-example': { bg: Colors.secondaryLight, border: Colors.secondary },
    'food-science': { bg: '#F3EDFC', border: '#7C4DBA' },
  };

  if (loading) {
    return <LoadingState message="Personalising your learning content…" />;
  }

  if (error) {
    return (
      <View style={styles.root}>
        <Text style={styles.screenTitle}>Explore & Learn</Text>
        <ErrorState message={error} onRetry={fetchCards} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Explore & Learn</Text>
      <Text style={styles.screenSubtitle}>
        Personalised reads based on your eating habits and preferences — refreshed each time you visit.
      </Text>

      {cards.map((card) => {
        const theme = cardColor[card.category] ?? { bg: Colors.primaryLight, border: Colors.primary };
        return (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: theme.bg, borderLeftColor: theme.border }]}
            onPress={() => toggle(card.id)}
            activeOpacity={0.85}
            accessibilityLabel={card.title}
            accessibilityRole="button"
            accessibilityState={{ expanded: expanded === card.id }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Ionicons
                name={expanded === card.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </View>
            {expanded === card.id && (
              <Text style={styles.cardBody}>{card.body}</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  screenTitle: {
    fontSize: Typography.fontSize2XL, fontWeight: Typography.fontWeightBold,
    color: Colors.text, paddingTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  screenSubtitle: {
    fontSize: Typography.fontSizeMD, color: Colors.textMuted,
    lineHeight: 22, marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: Radii.lg, padding: Spacing.md,
    marginBottom: Spacing.sm, borderLeftWidth: 3, ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardEmoji: { fontSize: 22 },
  cardTitle: {
    flex: 1, fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold, color: Colors.text, lineHeight: 22,
  },
  cardBody: {
    fontSize: Typography.fontSizeMD, color: Colors.text,
    lineHeight: 24, marginTop: Spacing.md,
  },
  footer: { height: Spacing.md },
});
