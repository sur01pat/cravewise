import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radii, Shadows } from '../../constants/theme';
import { UserProfile, DietaryPreference, CookingConfidence } from '../../types';
import { loadProfile, saveProfile, clearAllHistory, loadSaved } from '../../store/storage';
import { Chip, Button, LoadingState } from '../../components/UI';
import { apiWeeklyReflection } from '../../utils/apiClient';
import { WeeklyReflectionResponse } from '../../types/api';

const DIETARY_OPTIONS: DietaryPreference[] = ['omnivore', 'vegetarian', 'vegan'];
const CONFIDENCE_OPTIONS: CookingConfidence[] = ['beginner', 'intermediate', 'confident'];
const COMMON_ALLERGIES = ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish'];

// Rolling 7-day window
function isThisWeek(ts: number): boolean {
  return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
}

/** Returns up to 2 uppercase initials from the user's name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reflection, setReflection] = useState<WeeklyReflectionResponse | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setProfile(p);
      setProfileLoaded(true);
    }).catch(() => {
      setProfile({
        name: '', phone: '', photo: null,
        dietaryPreference: 'omnivore', allergies: [], dislikes: [],
        cookingConfidence: 'intermediate', typicalMealTimes: [],
        budgetPreference: 'mid-range', savedCombinations: [], pantry: [],
      });
      setProfileLoaded(true);
    });
  }, []);

  // Fetch weekly reflection whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      async function fetchReflection() {
        setReflectionLoading(true);
        try {
          const saved = await loadSaved();
          const thisWeek = saved.filter((s) => isThisWeek(s.savedAt)).map((s) => s.name);
          const data = await apiWeeklyReflection(thisWeek);
          setReflection(data);
        } catch {
          // Reflection is non-critical — fail silently
        } finally {
          setReflectionLoading(false);
        }
      }
      fetchReflection();
    }, []),
  );

  async function update(patch: Partial<UserProfile>) {
    if (!profile) return;
    const updated = { ...profile, ...patch };
    setProfile(updated);
    await saveProfile(updated);
  }

  function toggleAllergy(allergy: string) {
    if (!profile) return;
    const current = profile.allergies;
    update({
      allergies: current.includes(allergy)
        ? current.filter((a) => a !== allergy)
        : [...current, allergy],
    });
  }

  async function handlePickPhoto() {
    Alert.alert(
      'Profile photo',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission required', 'Camera access is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              cameraType: ImagePicker.CameraType.front,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              update({ photo: `data:image/jpeg;base64,${result.assets[0].base64}` });
            }
          },
        },
        {
          text: 'Photo library',
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission required', 'Photo library access is needed to pick a photo.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              update({ photo: `data:image/jpeg;base64,${result.assets[0].base64}` });
            }
          },
        },
        {
          text: 'Remove photo',
          style: 'destructive',
          onPress: () => update({ photo: null }),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  async function handleClearHistory() {
    Alert.alert(
      'Clear all history',
      'This will permanently delete all saved combinations and pantry items. Your preferences will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllHistory();
            Alert.alert('Done', 'Your history has been cleared.');
          },
        },
      ],
    );
  }

  if (!profileLoaded) return (
    <View style={{ flex: 1, backgroundColor: Colors.background }} />
  );
  if (!profile) return null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Profile</Text>

      {/* ── Avatar + photo picker ─────────────────────────── */}
      <View style={styles.avatarSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handlePickPhoto}
          accessibilityLabel="Change profile photo"
        >
          {profile.photo ? (
            <Image source={{ uri: profile.photo }} style={styles.avatarImage} />
          ) : profile.name.trim() ? (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials(profile.name)}</Text>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color={Colors.white} />
            </View>
          )}
          <View style={styles.cameraChip}>
            <Ionicons name="camera" size={13} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <View style={styles.avatarInfo}>
          <Text style={styles.avatarName}>{profile.name || 'Your name'}</Text>
          <Text style={styles.avatarPhone}>{profile.phone || 'Add mobile number'}</Text>
        </View>
      </View>

      {/* ── Name ─────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Your name (optional)</Text>
      <TextInput
        style={styles.fieldInput}
        value={profile.name}
        onChangeText={(t) => update({ name: t })}
        placeholder="Add your name…"
        placeholderTextColor={Colors.textLight}
        accessibilityLabel="Your name"
        returnKeyType="next"
      />

      {/* ── Mobile number ─────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Mobile number (optional)</Text>
      <View style={styles.phoneRow}>
        <Ionicons name="call-outline" size={18} color={Colors.textLight} style={styles.phoneIcon} />
        <TextInput
          style={styles.phoneInput}
          value={profile.phone}
          onChangeText={(t) => update({ phone: t })}
          placeholder="+1 555 000 0000"
          placeholderTextColor={Colors.textLight}
          keyboardType="phone-pad"
          accessibilityLabel="Mobile number"
          returnKeyType="done"
        />
      </View>

      {/* ── Dietary preference ───────────────────────────── */}
      <Text style={styles.sectionLabel}>Dietary preference</Text>
      <View style={styles.chipRow}>
        {DIETARY_OPTIONS.map((d) => (
          <Chip
            key={d}
            label={d.charAt(0).toUpperCase() + d.slice(1)}
            selected={profile.dietaryPreference === d}
            onPress={() => update({ dietaryPreference: d })}
          />
        ))}
      </View>

      {/* ── Allergies ────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Allergies & foods to avoid</Text>
      <Text style={styles.fieldNote}>These are treated as high priority — we'll never suggest these.</Text>
      <View style={styles.chipRow}>
        {COMMON_ALLERGIES.map((a) => (
          <Chip
            key={a}
            label={a}
            selected={profile.allergies.includes(a)}
            onPress={() => toggleAllergy(a)}
          />
        ))}
      </View>

      {/* ── Cooking confidence ───────────────────────────── */}
      <Text style={styles.sectionLabel}>Cooking confidence</Text>
      <View style={styles.chipRow}>
        {CONFIDENCE_OPTIONS.map((c) => (
          <Chip
            key={c}
            label={c.charAt(0).toUpperCase() + c.slice(1)}
            selected={profile.cookingConfidence === c}
            onPress={() => update({ cookingConfidence: c })}
          />
        ))}
      </View>

      {/* ── Budget ───────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>Budget preference</Text>
      <View style={styles.chipRow}>
        {(['budget', 'mid-range', 'flexible'] as const).map((b) => (
          <Chip
            key={b}
            label={b.charAt(0).toUpperCase() + b.slice(1)}
            selected={profile.budgetPreference === b}
            onPress={() => update({ budgetPreference: b })}
          />
        ))}
      </View>

      {/* ── Notifications ────────────────────────────────── */}
      <View style={styles.settingRow}>
        <View style={styles.settingLabel}>
          <Ionicons name="notifications-outline" size={20} color={Colors.textMuted} />
          <View>
            <Text style={styles.settingTitle}>Meal-time nudges</Text>
            <Text style={styles.settingDesc}>Optional reminders — no guilt, no pressure</Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.white}
          accessibilityLabel="Enable meal-time nudges"
        />
      </View>

      {/* ── Weekly reflection ────────────────────────────── */}
      <Text style={styles.sectionLabel}>This week's reflection</Text>
      {reflectionLoading ? (
        <View style={styles.reflectionCard}>
          <LoadingState message="Generating your weekly reflection…" />
        </View>
      ) : reflection ? (
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionHeadline}>{reflection.headline}</Text>
          <Text style={styles.reflectionInsight}>{reflection.insight}</Text>
          <View style={styles.reflectionSuggRow}>
            <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
            <Text style={styles.reflectionSugg}>{reflection.suggestion}</Text>
          </View>
        </View>
      ) : null}

      {/* ── Privacy & data ───────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Privacy & data</Text>
        <TouchableOpacity
          style={styles.dangerRow}
          onPress={handleClearHistory}
          accessibilityLabel="Clear all history"
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
          <Text style={styles.dangerText}>Clear all history and saved combinations</Text>
        </TouchableOpacity>
      </View>

      {/* ── Disclaimer ───────────────────────────────────── */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
        <Text style={styles.disclaimerText}>
          CraveWise provides general nutrition guidance only — not medical diagnosis or treatment.
          If you have health concerns, please consult a qualified professional.
        </Text>
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  screenTitle: {
    fontSize: Typography.fontSize2XL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  // ── Avatar section
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    position: 'relative',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInitials: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
  },
  cameraChip: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarInfo: { flex: 1 },
  avatarName: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.text,
    marginBottom: 4,
  },
  avatarPhone: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
  },

  // ── Fields
  sectionLabel: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  fieldNote: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  fieldInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: Typography.fontSizeMD,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  phoneIcon: { marginRight: 2 },
  phoneInput: {
    flex: 1,
    fontSize: Typography.fontSizeMD,
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.sm,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.text,
  },
  settingDesc: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: { marginTop: Spacing.md },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerText: {
    fontSize: Typography.fontSizeMD,
    color: Colors.error,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  disclaimerText: {
    flex: 1,
    fontSize: Typography.fontSizeXS,
    color: Colors.textLight,
    lineHeight: 18,
  },
  reflectionCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...Shadows.sm,
  },
  reflectionHeadline: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  reflectionInsight: {
    fontSize: Typography.fontSizeMD,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  reflectionSuggRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  reflectionSugg: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    color: Colors.primary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
