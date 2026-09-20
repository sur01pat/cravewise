import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedCombination, UserProfile, PantryItem } from '../types';

const KEYS = {
  PROFILE: 'cravewise_profile',
  SAVED: 'cravewise_saved',
  PANTRY: 'cravewise_pantry',
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  dietaryPreference: 'omnivore',
  allergies: [],
  dislikes: [],
  cookingConfidence: 'intermediate',
  typicalMealTimes: [],
  budgetPreference: 'mid-range',
  savedCombinations: [],
  pantry: [],
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  const current = await loadProfile();
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify({ ...current, ...profile }));
}

// ─── Saved Combinations ───────────────────────────────────────────────────────

export async function loadSaved(): Promise<SavedCombination[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCombination(combo: SavedCombination): Promise<void> {
  const existing = await loadSaved();
  const updated = [combo, ...existing.filter((c) => c.id !== combo.id)];
  await AsyncStorage.setItem(KEYS.SAVED, JSON.stringify(updated));
}

export async function deleteCombination(id: string): Promise<void> {
  const existing = await loadSaved();
  await AsyncStorage.setItem(KEYS.SAVED, JSON.stringify(existing.filter((c) => c.id !== id)));
}

export async function clearAllHistory(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.SAVED, KEYS.PANTRY]);
}

// ─── Pantry ───────────────────────────────────────────────────────────────────

export async function loadPantry(): Promise<PantryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PANTRY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function savePantry(items: PantryItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PANTRY, JSON.stringify(items));
}
