import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { HomeStackParamList, RootTabParamList } from '../../types';
import { loadProfile } from '../../store/storage';
import { AdBanner } from '../../components/AdBanner';
import { useAdsInitialized } from '../../../App';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<RootTabParamList>
>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PRIMARY_ACTIONS = [
  {
    id: 'Eating' as const,
    emoji: '🍽️',
    title: "I'm Eating",
    subtitle: 'Make this meal more satisfying',
    color: Colors.primary,
    bg: '#FDF0E8',
  },
  {
    id: 'HungryNow' as const,
    emoji: '⚡',
    title: "I'm Hungry Now",
    subtitle: 'Quick ideas based on your craving',
    color: '#C0851A',
    bg: '#FEF9E8',
  },
  {
    id: 'WhatIHave' as const,
    emoji: '🧺',
    title: "Here's What I Have",
    subtitle: 'Cook from your pantry',
    color: Colors.secondary,
    bg: '#EAF3F0',
  },
  {
    id: 'EatingOut' as const,
    emoji: '🍔',
    title: 'Eating Out',
    subtitle: 'Smart pairings at any restaurant',
    color: '#7C4DBA',
    bg: '#F3EDFC',
  },
];

const AVATAR_SIZE = 36;

export default function HomeScreen() {
  const adsInitialized = useAdsInitialized();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');

  // Refresh avatar whenever this screen comes into focus
  useEffect(() => {
    if (isFocused) {
      loadProfile().then((p) => {
        setPhoto(p.photo ?? null);
        setName(p.name ?? '');
      });
    }
  }, [isFocused]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.tagline}>Eat what you want. Make it work better for you.</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            accessibilityLabel="Profile"
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.profileAvatar} />
            ) : name.trim() ? (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarInitials}>{initials(name)}</Text>
              </View>
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Ionicons name="person" size={18} color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick action banner */}
        <TouchableOpacity
          style={styles.quickBanner}
          onPress={() => navigation.navigate('Eating')}
          activeOpacity={0.85}
          accessibilityLabel="Make this more satisfying"
        >
          <Ionicons name="sparkles-outline" size={22} color={Colors.primary} />
          <Text style={styles.quickBannerText}>Make this meal more satisfying →</Text>
        </TouchableOpacity>

        {/* Primary actions */}
        <Text style={styles.sectionLabel}>What do you need?</Text>
        <View style={styles.grid}>
          {PRIMARY_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: action.bg }]}
              onPress={() => navigation.navigate(action.id)}
              activeOpacity={0.82}
              accessibilityLabel={action.title}
            >
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
              <Text style={[styles.actionTitle, { color: action.color }]}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product promise */}
        <View style={styles.promiseCard}>
          <Text style={styles.promiseTitle}>No calorie counting. No food guilt. No restrictions.</Text>
          <Text style={styles.promiseBody}>
            CraveWise helps you eat the food you already love — with small, optional additions that make it more
            satisfying. You're always in control.
          </Text>
        </View>

        {/* Ad banner — clearly labelled, non-intrusive */}
        <AdBanner adsInitialized={adsInitialized} />

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  tagline: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 18,
  },
  profileBtn: { padding: 4 },
  profileAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  profileAvatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  profileAvatarInitials: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  quickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: 10,
    ...Shadows.sm,
  },
  quickBannerText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '47.5%',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  actionEmoji: { fontSize: 28, marginBottom: 6 },
  actionTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },
  actionSubtitle: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  promiseCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...Shadows.sm,
  },
  promiseTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 8,
  },
  promiseBody: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  footer: { height: Spacing.xxl },
});
