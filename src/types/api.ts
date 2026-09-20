/**
 * API contract types shared with cravewise-api.
 * Mirrors cravewise-api/src/types/api.ts exactly.
 */

export type FoodComponent = 'carbohydrate' | 'protein' | 'fat' | 'fibre' | 'produce' | 'volume';
export type DietaryPreference = 'vegetarian' | 'vegan' | 'omnivore';
export type CookingConfidence = 'beginner' | 'intermediate' | 'confident';
export type HungerLevel = 'a little hungry' | 'hungry' | 'very hungry';
export type MealContext = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'late-night';
export type TimeAvailable = '2 minutes' | '5 minutes' | '15+ minutes';
export type EffortLevel = 'no-cook' | 'minimal effort' | 'willing to cook';
export type CravingType = 'sweet' | 'salty' | 'crunchy' | 'creamy' | 'warm' | 'cold' | 'comfort food';

export interface UserContext {
  dietaryPreference: DietaryPreference;
  allergies: string[];
  dislikes: string[];
  cookingConfidence: CookingConfidence;
  budgetPreference: 'budget' | 'mid-range' | 'flexible';
  recentSaved?: string[];
  pantryItems?: string[];
}

// ─── POST /api/recommend ──────────────────────────────────────────────────────

export interface Suggestion {
  id: string;
  text: string;
  reasoning: string;
  components: FoodComponent[];
  category: 'addition' | 'swap' | 'pairing';
}

export interface RecommendResponse {
  mealDescription: string;
  detectedComponents: FoodComponent[];
  missingComponents: FoodComponent[];
  explanation: string;
  suggestions: Suggestion[];
}

// ─── POST /api/hungry-now ─────────────────────────────────────────────────────

export interface HungryNowSuggestion {
  title: string;
  description: string;
  time: string;
  effort: string;
  whyItWorks: string;
}

export interface HungryNowResponse {
  suggestions: HungryNowSuggestion[];
  contextNote: string;
}

// ─── POST /api/eating-out ─────────────────────────────────────────────────────

export interface EatingOutPairing {
  pairing: string;
  reasoning: string;
  isOptional: true;
}

export interface EatingOutResponse {
  mainFood: string;
  affirmation: string;
  pairings: EatingOutPairing[];
}

// ─── POST /api/pantry-meals ───────────────────────────────────────────────────

export interface PantryMeal {
  title: string;
  description: string;
  usesIngredients: string[];
  prepTime: string;
  effort: string;
  whyItWorks: string;
}

export interface PantryMealsResponse {
  meals: PantryMeal[];
  missingComponentNote?: string;
}

// ─── POST /api/explore/cards ──────────────────────────────────────────────────

export interface ExploreCard {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: 'hunger-crushing-combo' | 'myth-vs-reality' | 'real-life-example' | 'food-science';
}

export interface ExploreCardsResponse {
  cards: ExploreCard[];
}

// ─── POST /api/weekly-reflection ─────────────────────────────────────────────

export interface WeeklyReflectionResponse {
  headline: string;
  insight: string;
  suggestion: string;
}

// ─── Error envelope ───────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: 'VALIDATION_ERROR' | 'GEMINI_ERROR' | 'RATE_LIMITED' | 'INTERNAL_ERROR';
}
