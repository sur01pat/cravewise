/**
 * Tests for the recommendation engine.
 * Run with: npx jest --testPathPattern=engine
 */

import {
  detectComponents,
  buildRecommendation,
  buildHungryNowSuggestions,
  buildEatingOutSuggestions,
} from '../src/engine/recommendations';

// ─── detectComponents ─────────────────────────────────────────────────────────

describe('detectComponents', () => {
  test('detects carbohydrate in "instant noodles"', () => {
    const { components } = detectComponents('instant noodles');
    expect(components.has('carbohydrate')).toBe(true);
  });

  test('detects protein in "egg"', () => {
    const { components } = detectComponents('egg');
    expect(components.has('protein')).toBe(true);
  });

  test('detects fat in "peanut butter"', () => {
    const { components } = detectComponents('peanut butter');
    expect(components.has('fat')).toBe(true);
  });

  test('detects fibre from vegetables', () => {
    const { components } = detectComponents('salad');
    expect(components.has('fibre')).toBe(true);
  });

  test('handles normalised text like "PB toast"', () => {
    const { components } = detectComponents('PB toast');
    // PB → peanut butter (fat/protein), toast → bread (carbohydrate)
    expect(components.has('fat')).toBe(true);
    expect(components.has('carbohydrate')).toBe(true);
  });

  test('dal rice detects carbohydrate and protein', () => {
    const { components } = detectComponents('dal rice');
    expect(components.has('carbohydrate')).toBe(true);
    expect(components.has('protein')).toBe(true);
  });

  test('returns empty set for unknown food', () => {
    const { components } = detectComponents('unicorn stew');
    expect(components.size).toBe(0);
  });
});

// ─── buildRecommendation ─────────────────────────────────────────────────────

describe('buildRecommendation', () => {
  test('returns between 1 and 3 suggestions', () => {
    const result = buildRecommendation('toast');
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestions.length).toBeLessThanOrEqual(3);
  });

  test('includes a non-empty explanation', () => {
    const result = buildRecommendation('instant noodles');
    expect(result.explanation.length).toBeGreaterThan(10);
  });

  test('never exposes calorie or macro language in explanations', () => {
    const result = buildRecommendation('pizza');
    const combined = [result.explanation, ...result.suggestions.map((s) => s.reasoning)].join(' ');
    expect(combined.toLowerCase()).not.toContain('calorie');
    expect(combined.toLowerCase()).not.toContain('macro');
    expect(combined.toLowerCase()).not.toContain('deficit');
  });

  test('suggestion reasoning is non-empty', () => {
    const result = buildRecommendation('cereal');
    result.suggestions.forEach((s) => {
      expect(s.reasoning.length).toBeGreaterThan(5);
    });
  });

  test('returns a fallback suggestion for a complete meal', () => {
    // egg on avocado toast = protein + fat + carb + fibre — all covered
    const result = buildRecommendation('egg avocado toast');
    // Should still return something (a keep-it or minimal suggestion)
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
  });

  test('detectedComponents matches known meal', () => {
    const result = buildRecommendation('rice');
    expect(result.detectedComponents).toContain('carbohydrate');
  });
});

// ─── buildHungryNowSuggestions ────────────────────────────────────────────────

describe('buildHungryNowSuggestions', () => {
  const baseInputs = {
    hungerLevel: 'very hungry' as const,
    context: 'dinner' as const,
    timeAvailable: '5 minutes' as const,
    effort: 'minimal effort' as const,
    cravings: ['salty' as const, 'warm' as const],
  };

  test('returns at least 1 suggestion', () => {
    const results = buildHungryNowSuggestions(baseInputs);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test('returns at most 4 suggestions', () => {
    const results = buildHungryNowSuggestions(baseInputs);
    expect(results.length).toBeLessThanOrEqual(4);
  });

  test('every suggestion has a title and description', () => {
    const results = buildHungryNowSuggestions(baseInputs);
    results.forEach((r) => {
      expect(r.title.length).toBeGreaterThan(2);
      expect(r.description.length).toBeGreaterThan(5);
    });
  });

  test('sweet craving returns a relevant suggestion', () => {
    const results = buildHungryNowSuggestions({
      ...baseInputs,
      cravings: ['sweet'],
    });
    const text = results.map((r) => r.title + r.description).join(' ').toLowerCase();
    expect(text).toMatch(/yogurt|oat|fruit|sweet|honey/);
  });

  test('handles empty cravings (fallback)', () => {
    const results = buildHungryNowSuggestions({
      ...baseInputs,
      cravings: [],
    });
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test('does not contain calorie language', () => {
    const results = buildHungryNowSuggestions(baseInputs);
    const text = results.map((r) => r.title + r.description).join(' ').toLowerCase();
    expect(text).not.toContain('calorie');
    expect(text).not.toContain('macro');
  });
});

// ─── buildEatingOutSuggestions ────────────────────────────────────────────────

describe('buildEatingOutSuggestions', () => {
  test('returns suggestions for a burger', () => {
    const results = buildEatingOutSuggestions('burger', 'Burger');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test('burger suggestions mention salad or produce', () => {
    const results = buildEatingOutSuggestions('burger', 'Burger');
    const text = results.map((r) => r.pairing + r.reasoning).join(' ').toLowerCase();
    expect(text).toMatch(/salad|fibre|produce|vegetable/);
  });

  test('pizza suggestions exist', () => {
    const results = buildEatingOutSuggestions('pizza', 'Pizza');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test('generic food returns fallback suggestions', () => {
    const results = buildEatingOutSuggestions('random food item', 'Other');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test('all pairings have non-empty reasoning', () => {
    const results = buildEatingOutSuggestions('sushi', 'Sushi / Japanese');
    results.forEach((r) => {
      expect(r.reasoning.length).toBeGreaterThan(5);
    });
  });

  test('never includes calorie-based ranking language', () => {
    const results = buildEatingOutSuggestions('pizza', 'Pizza');
    const text = results.map((r) => r.pairing + r.reasoning).join(' ').toLowerCase();
    expect(text).not.toContain('calorie');
    expect(text).not.toContain('shame');
    expect(text).not.toContain('bad for you');
  });
});
