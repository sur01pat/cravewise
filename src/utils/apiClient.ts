/**
 * API client for the CraveWise backend.
 *
 * Base URL is read from the EXPO_PUBLIC_API_URL environment variable.
 * Set it in app.config.ts / .env. Defaults to localhost:3000 for dev.
 *
 * All functions:
 *   1. Build a UserContext from the stored profile automatically.
 *   2. POST to the backend.
 *   3. Return typed responses.
 *   4. Throw ApiCallError on non-2xx so callers can show user-friendly messages.
 */

import { loadProfile, loadSaved, loadPantry } from '../store/storage';
import {
  UserContext,
  RecommendResponse,
  HungryNowResponse,
  EatingOutResponse,
  PantryMealsResponse,
  ExploreCardsResponse,
  WeeklyReflectionResponse,
  HungerLevel,
  MealContext,
  TimeAvailable,
  EffortLevel,
  CravingType,
  ApiError,
} from '../types/api';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = (
  // Expo public env var set in .env / app.config.ts
  // e.g. EXPO_PUBLIC_API_URL=http://localhost:3000
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiCallError extends Error {
  public readonly code: ApiError['code'];
  public readonly status: number;

  constructor(message: string, code: ApiError['code'], status: number) {
    super(message);
    this.name = 'ApiCallError';
    this.code = code;
    this.status = status;
  }
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = data as ApiError;
    throw new ApiCallError(
      err.error ?? 'Request failed.',
      err.code ?? 'INTERNAL_ERROR',
      response.status,
    );
  }

  return data as T;
}

// ─── Build UserContext from stored profile ─────────────────────────────────

async function buildUserContext(opts?: {
  includePantry?: boolean;
  includeSaved?: boolean;
}): Promise<UserContext> {
  const [profile, saved, pantry] = await Promise.all([
    loadProfile(),
    opts?.includeSaved ? loadSaved() : Promise.resolve([]),
    opts?.includePantry ? loadPantry() : Promise.resolve([]),
  ]);

  return {
    dietaryPreference: profile.dietaryPreference,
    allergies: profile.allergies,
    dislikes: profile.dislikes,
    cookingConfidence: profile.cookingConfidence,
    budgetPreference: profile.budgetPreference,
    recentSaved: saved.slice(0, 5).map((s) => s.name),
    pantryItems: pantry.map((p) => p.name),
  };
}

// ─── Public API functions ─────────────────────────────────────────────────────

/**
 * Analyse a meal and return personalised, Gemini-generated suggestions.
 * Called from the I'm Eating screen.
 */
export async function apiRecommend(mealDescription: string): Promise<RecommendResponse> {
  const userContext = await buildUserContext({ includeSaved: true, includePantry: true });
  return post<RecommendResponse>('/api/recommend', { mealDescription, userContext });
}

/**
 * Generate personalised meal ideas based on hunger state, context and craving.
 * Called from the I'm Hungry Now screen.
 */
export async function apiHungryNow(inputs: {
  hungerLevel: HungerLevel;
  context: MealContext;
  timeAvailable: TimeAvailable;
  effort: EffortLevel;
  cravings: CravingType[];
}): Promise<HungryNowResponse> {
  const userContext = await buildUserContext({ includePantry: true });
  return post<HungryNowResponse>('/api/hungry-now', { ...inputs, userContext });
}

/**
 * Generate optional, food-first pairings for eating out.
 * Called from the Eating Out screen.
 */
export async function apiEatingOut(input: {
  food: string;
  cuisine?: string;
  occasion?: string;
}): Promise<EatingOutResponse> {
  const userContext = await buildUserContext();
  return post<EatingOutResponse>('/api/eating-out', { ...input, userContext });
}

/**
 * Generate meal ideas from the user's pantry ingredients.
 * Called from the Here's What I Have screen.
 */
export async function apiPantryMeals(ingredients: string[]): Promise<PantryMealsResponse> {
  const userContext = await buildUserContext();
  return post<PantryMealsResponse>('/api/pantry-meals', { ingredients, userContext });
}

/**
 * Fetch personalised, dynamic educational cards for the Explore screen.
 * Called on focus of the Explore tab.
 */
export async function apiExploreCards(recentMeals?: string[]): Promise<ExploreCardsResponse> {
  const userContext = await buildUserContext({ includeSaved: true });
  return post<ExploreCardsResponse>('/api/explore/cards', { userContext, recentMeals });
}

/**
 * Generate a personalised weekly reflection.
 * Called from the Profile screen.
 */
export async function apiWeeklyReflection(savedThisWeek: string[]): Promise<WeeklyReflectionResponse> {
  const userContext = await buildUserContext();
  return post<WeeklyReflectionResponse>('/api/weekly-reflection', { savedThisWeek, userContext });
}
