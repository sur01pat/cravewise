// ─── Food & Meal Types ──────────────────────────────────────────────────────

export type FoodComponent = 'carbohydrate' | 'protein' | 'fat' | 'fibre' | 'produce' | 'volume';

export interface FoodItem {
  id: string;
  name: string;
  components: FoodComponent[];
}

export interface Meal {
  id: string;
  description: string;
  items: FoodItem[];
  detectedComponents: FoodComponent[];
  timestamp: number;
}

// ─── Recommendation Types ───────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  text: string;
  reasoning: string;
  components: FoodComponent[];
  category: 'addition' | 'swap' | 'pairing';
}

export interface RecommendationResult {
  mealDescription: string;
  detectedComponents: FoodComponent[];
  missingComponents: FoodComponent[];
  suggestions: Suggestion[];
  explanation: string;
}

// ─── Hunger Now Types ───────────────────────────────────────────────────────

export type HungerLevel = 'a little hungry' | 'hungry' | 'very hungry';
export type MealContext = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'late-night';
export type TimeAvailable = '2 minutes' | '5 minutes' | '15+ minutes';
export type EffortLevel = 'no-cook' | 'minimal effort' | 'willing to cook';
export type CravingType = 'sweet' | 'salty' | 'crunchy' | 'creamy' | 'warm' | 'cold' | 'comfort food';

export interface HungryNowInputs {
  hungerLevel: HungerLevel | null;
  context: MealContext | null;
  timeAvailable: TimeAvailable | null;
  effort: EffortLevel | null;
  cravings: CravingType[];
}

// ─── Saved Combination Types ─────────────────────────────────────────────────

export interface SavedCombination {
  id: string;
  name: string;
  mealDescription: string;
  suggestions: Suggestion[];
  savedAt: number;
  tags: string[];
}

// ─── Pantry Types ────────────────────────────────────────────────────────────

export interface PantryItem {
  id: string;
  name: string;
  expiresAt?: number;
}

// ─── Profile / Preference Types ─────────────────────────────────────────────

export type DietaryPreference = 'vegetarian' | 'vegan' | 'omnivore';
export type CookingConfidence = 'beginner' | 'intermediate' | 'confident';

export interface UserProfile {
  name: string;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  dislikes: string[];
  cookingConfidence: CookingConfidence;
  typicalMealTimes: string[];
  budgetPreference: 'budget' | 'mid-range' | 'flexible';
  savedCombinations: SavedCombination[];
  pantry: PantryItem[];
}

// ─── Navigation Types ────────────────────────────────────────────────────────

export type RootTabParamList = {
  // Home accepts nested navigator params so cross-tab navigation works
  Home: { screen: keyof HomeStackParamList; params?: HomeStackParamList[keyof HomeStackParamList] } | undefined;
  Explore: undefined;
  Saved: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Eating: undefined;
  HungryNow: undefined;
  WhatIHave: undefined;
  EatingOut: undefined;
  CravingSupport: undefined;
  RecommendationResult: { result: RecommendationResult; mealDescription: string };
};
