/**
 * Rule-based Hunger Crushing Combo recommendation engine.
 * No calorie counting, no macro targets, no shame.
 */

import {
  FoodComponent,
  HungryNowInputs,
  RecommendationResult,
  Suggestion,
} from '../types';

// ─── Food Component Database ─────────────────────────────────────────────────

interface FoodEntry {
  aliases: string[];
  components: FoodComponent[];
}

const FOOD_DB: FoodEntry[] = [
  // Carbohydrates
  { aliases: ['noodles', 'instant noodles', 'ramen', 'pasta', 'spaghetti'], components: ['carbohydrate'] },
  { aliases: ['rice', 'dal rice', 'fried rice', 'white rice', 'brown rice'], components: ['carbohydrate'] },
  { aliases: ['bread', 'toast', 'sourdough', 'white bread'], components: ['carbohydrate'] },
  { aliases: ['bagel', 'croissant', 'muffin', 'wrap', 'tortilla'], components: ['carbohydrate'] },
  { aliases: ['oats', 'porridge', 'oatmeal', 'granola'], components: ['carbohydrate'] },
  { aliases: ['cereal', 'cornflakes'], components: ['carbohydrate'] },
  { aliases: ['potato', 'potatoes', 'chips', 'fries', 'sweet potato'], components: ['carbohydrate', 'fibre'] },
  { aliases: ['pizza', 'pizza base'], components: ['carbohydrate', 'fat'] },
  { aliases: ['burger', 'hamburger', 'cheeseburger', 'burger bun'], components: ['carbohydrate', 'protein', 'fat'] },
  { aliases: ['sandwich', 'sub', 'panini'], components: ['carbohydrate'] },

  // Proteins
  { aliases: ['egg', 'eggs', 'scrambled eggs', 'fried egg', 'boiled egg', 'poached egg'], components: ['protein', 'fat'] },
  { aliases: ['chicken', 'grilled chicken', 'roast chicken', 'chicken breast'], components: ['protein'] },
  { aliases: ['tuna', 'canned tuna', 'salmon', 'fish'], components: ['protein', 'fat'] },
  { aliases: ['tofu', 'tempeh', 'edamame'], components: ['protein'] },
  { aliases: ['lentils', 'dal', 'lentil soup', 'chickpeas', 'beans', 'black beans'], components: ['protein', 'fibre'] },
  { aliases: ['greek yogurt', 'yogurt', 'cottage cheese'], components: ['protein', 'fat'] },
  { aliases: ['cheese', 'cheddar', 'mozzarella', 'feta'], components: ['protein', 'fat'] },
  { aliases: ['deli meat', 'ham', 'turkey', 'salami'], components: ['protein', 'fat'] },

  // Fats
  { aliases: ['avocado', 'avo'], components: ['fat', 'fibre'] },
  { aliases: ['peanut butter', 'pb', 'almond butter', 'nut butter'], components: ['fat', 'protein'] },
  { aliases: ['peanuts', 'nuts', 'almonds', 'cashews', 'walnuts'], components: ['fat', 'protein'] },
  { aliases: ['olive oil', 'butter', 'oil'], components: ['fat'] },
  { aliases: ['hummus'], components: ['fat', 'protein', 'fibre'] },

  // Fibre / Produce / Volume
  { aliases: ['vegetables', 'veggies', 'salad', 'mixed veg'], components: ['fibre', 'produce', 'volume'] },
  { aliases: ['spinach', 'kale', 'lettuce', 'arugula', 'greens'], components: ['fibre', 'produce'] },
  { aliases: ['tomato', 'tomatoes', 'cherry tomatoes'], components: ['fibre', 'produce'] },
  { aliases: ['cucumber', 'celery', 'capsicum', 'bell pepper', 'carrot', 'broccoli'], components: ['fibre', 'produce'] },
  { aliases: ['banana', 'apple', 'orange', 'berries', 'fruit', 'grapes'], components: ['fibre', 'produce'] },
  { aliases: ['mushrooms', 'zucchini', 'onion', 'garlic'], components: ['fibre', 'produce', 'volume'] },

  // Beverages
  { aliases: ['coffee', 'espresso', 'latte', 'cappuccino'], components: ['volume'] },
  { aliases: ['tea', 'green tea', 'chai'], components: ['volume'] },
  { aliases: ['milk', 'almond milk', 'oat milk'], components: ['protein', 'fat'] },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

export function detectComponents(mealText: string): { items: string[]; components: Set<FoodComponent> } {
  const normalized = normalizeText(mealText);
  const detectedComponents = new Set<FoodComponent>();
  const detectedItems: string[] = [];

  for (const entry of FOOD_DB) {
    for (const alias of entry.aliases) {
      if (normalized.includes(normalizeText(alias))) {
        entry.components.forEach((c) => detectedComponents.add(c));
        if (!detectedItems.find((i) => entry.aliases[0] === i)) {
          detectedItems.push(entry.aliases[0]);
        }
        break;
      }
    }
  }

  return { items: detectedItems, components: detectedComponents };
}

// ─── Suggestion Library ───────────────────────────────────────────────────────

interface SuggestionTemplate {
  id: string;
  text: string;
  reasoning: string;
  addsComponents: FoodComponent[];
  category: 'addition' | 'swap' | 'pairing';
  effort: ('no-cook' | 'minimal effort' | 'willing to cook')[];
  tags: string[];
}

const SUGGESTION_LIBRARY: SuggestionTemplate[] = [
  // Protein additions
  {
    id: 'add-egg',
    text: 'Add a quick fried or boiled egg',
    reasoning: 'Eggs add protein that helps you feel satisfied for longer — ready in 2 minutes.',
    addsComponents: ['protein', 'fat'],
    category: 'addition',
    effort: ['minimal effort', 'willing to cook'],
    tags: ['breakfast', 'snack', 'lunch'],
  },
  {
    id: 'add-peanut-butter',
    text: 'Stir in a spoonful of peanut butter',
    reasoning: 'Peanut butter adds protein and satisfying fat — and it\'s ready instantly.',
    addsComponents: ['protein', 'fat'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['snack', 'breakfast'],
  },
  {
    id: 'add-greek-yogurt',
    text: 'Pair with a small Greek yogurt',
    reasoning: 'Greek yogurt is a high-protein, creamy addition that takes seconds to serve.',
    addsComponents: ['protein', 'fat'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['breakfast', 'snack'],
  },
  {
    id: 'add-beans',
    text: 'Toss in some canned beans or chickpeas',
    reasoning: 'Beans add plant protein and fibre — a filling combo straight from the can.',
    addsComponents: ['protein', 'fibre'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['lunch', 'dinner'],
  },
  {
    id: 'add-tuna',
    text: 'Mix in a tin of tuna or salmon',
    reasoning: 'Canned fish is a fast, affordable protein hit with almost no prep needed.',
    addsComponents: ['protein', 'fat'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['lunch', 'dinner'],
  },
  {
    id: 'add-cheese',
    text: 'Sprinkle some cheese on top',
    reasoning: 'A little cheese adds satisfying fat and flavour — zero extra cooking required.',
    addsComponents: ['fat', 'protein'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['lunch', 'dinner', 'snack'],
  },
  // Fibre / Produce additions
  {
    id: 'add-vegetables',
    text: 'Add a handful of vegetables or salad',
    reasoning: 'Vegetables add volume and fibre, which help you feel full without changing the main dish.',
    addsComponents: ['fibre', 'produce', 'volume'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['lunch', 'dinner', 'snack'],
  },
  {
    id: 'add-banana',
    text: 'Have a piece of fruit on the side',
    reasoning: 'Fruit is a quick, portable way to add fibre and natural sweetness to any meal.',
    addsComponents: ['fibre', 'produce'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['breakfast', 'snack'],
  },
  {
    id: 'add-avocado',
    text: 'Add some sliced avocado',
    reasoning: 'Avocado adds creamy, satisfying fat and fibre — no cooking needed.',
    addsComponents: ['fat', 'fibre'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['breakfast', 'lunch', 'snack'],
  },
  {
    id: 'add-hummus',
    text: 'Serve with hummus for dipping or spreading',
    reasoning: 'Hummus adds protein, fat and fibre — all three in one simple dip.',
    addsComponents: ['fat', 'protein', 'fibre'],
    category: 'addition',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['snack', 'lunch'],
  },
  // Protein swaps
  {
    id: 'swap-tofu',
    text: 'Try firm tofu as a plant-based protein swap',
    reasoning: 'Tofu soaks up flavours and adds protein — great for a plant-based option.',
    addsComponents: ['protein'],
    category: 'swap',
    effort: ['minimal effort', 'willing to cook'],
    tags: ['lunch', 'dinner'],
  },
  // Pairings
  {
    id: 'pair-nuts',
    text: 'Grab a small handful of nuts or seeds',
    reasoning: 'Nuts add satisfying crunch, fat and a little protein — perfect alongside a lighter meal.',
    addsComponents: ['fat', 'protein'],
    category: 'pairing',
    effort: ['no-cook', 'minimal effort', 'willing to cook'],
    tags: ['snack', 'breakfast'],
  },
];

// ─── Core Recommendation Logic ─────────────────────────────────────────────────

export function buildRecommendation(mealText: string): RecommendationResult {
  const { items, components } = detectComponents(mealText);

  const ALL_COMPONENTS: FoodComponent[] = ['carbohydrate', 'protein', 'fat', 'fibre'];
  const missing = ALL_COMPONENTS.filter((c) => !components.has(c));

  // Score each suggestion by how many missing components it fills
  const scored = SUGGESTION_LIBRARY.map((s) => {
    const fills = s.addsComponents.filter((c) => missing.includes(c)).length;
    const overlaps = s.addsComponents.filter((c) => components.has(c)).length;
    return { s, score: fills * 3 - overlaps };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ s }) => ({
      id: s.id,
      text: s.text,
      reasoning: s.reasoning,
      components: s.addsComponents,
      category: s.category,
    }));

  const componentLabels: Record<FoodComponent, string> = {
    carbohydrate: 'carbs for energy',
    protein: 'protein for staying power',
    fat: 'satisfying fat',
    fibre: 'fibre and produce',
    produce: 'fresh produce',
    volume: 'filling volume',
  };

  const presentLabels = [...components].map((c) => componentLabels[c]).slice(0, 2);
  const explanation =
    presentLabels.length > 0
      ? `This meal already has ${presentLabels.join(' and ')}. The suggestions below can make it even more satisfying.`
      : 'Here are a few easy ways to make this more satisfying — take what works for you.';

  return {
    mealDescription: mealText,
    detectedComponents: [...components],
    missingComponents: missing,
    suggestions: scored.length > 0
      ? scored
      : [
          {
            id: 'keep-it',
            text: 'This looks like a solid meal!',
            reasoning: 'It already has a good balance of satisfying components.',
            components: [],
            category: 'addition',
          },
        ],
    explanation,
  };
}

// ─── Hungry Now Recommendations ──────────────────────────────────────────────

interface HungryNowSuggestion {
  title: string;
  description: string;
  time: string;
  effort: string;
}

export function buildHungryNowSuggestions(inputs: HungryNowInputs): HungryNowSuggestion[] {
  const { hungerLevel, context, timeAvailable, effort, cravings } = inputs;

  const isSweet = cravings.includes('sweet');
  const isSalty = cravings.includes('salty') || cravings.includes('comfort food');
  const isCrunchy = cravings.includes('crunchy');
  const isCreamy = cravings.includes('creamy');
  const isWarm = cravings.includes('warm');
  const isCold = cravings.includes('cold');
  const isVeryHungry = hungerLevel === 'very hungry';
  const isQuick = timeAvailable === '2 minutes' || timeAvailable === '5 minutes';

  const pool: HungryNowSuggestion[] = [];

  if (isSalty && isWarm && isQuick) {
    pool.push({
      title: 'Instant noodles with egg & veg',
      description: 'Cook the noodles, crack an egg in for the last minute, toss in whatever veg you have.',
      time: '5 minutes',
      effort: 'Minimal effort',
    });
  }

  if (isSalty) {
    pool.push({
      title: 'Rice with dal or beans',
      description: 'Leftover rice topped with canned dal or beans. Quick, filling and satisfying.',
      time: '5 minutes',
      effort: 'No cook',
    });
    pool.push({
      title: 'Toast with peanut butter & banana',
      description: 'Toast the bread, spread peanut butter, add sliced banana. Carbs + protein + fat.',
      time: '5 minutes',
      effort: 'Minimal effort',
    });
  }

  if (isSweet) {
    pool.push({
      title: 'Greek yogurt with fruit & granola',
      description: 'Layer yogurt, fruit and granola for protein, fibre and a satisfying crunch.',
      time: '2 minutes',
      effort: 'No cook',
    });
    pool.push({
      title: 'Oats with peanut butter & honey',
      description: 'Quick oats topped with peanut butter and a drizzle of honey.',
      time: '5 minutes',
      effort: 'Minimal effort',
    });
  }

  if (isCreamy) {
    pool.push({
      title: 'Avocado toast with egg',
      description: 'Mashed avo on toast with a poached or fried egg. Creamy, satisfying and filling.',
      time: '10 minutes',
      effort: 'Minimal effort',
    });
    pool.push({
      title: 'Hummus with vegetables & pita',
      description: 'Hummus is protein + fat + fibre in one dip. Pair with crunchy veg and pita.',
      time: '2 minutes',
      effort: 'No cook',
    });
  }

  if (isCrunchy) {
    pool.push({
      title: 'Trail mix with fruit',
      description: 'Nuts, seeds, dried fruit and dark chocolate chips. Crunchy, portable and filling.',
      time: '2 minutes',
      effort: 'No cook',
    });
  }

  if (isVeryHungry) {
    pool.push({
      title: 'Egg fried rice',
      description: 'Leftover rice, two eggs and whatever veg you have. A satisfying, complete meal.',
      time: '10 minutes',
      effort: 'Minimal effort',
    });
    pool.push({
      title: 'Pasta with cheese & peas',
      description: 'Quick pasta with melted cheese and frozen peas for protein and fibre.',
      time: '15 minutes',
      effort: 'Willing to cook',
    });
  }

  if (context === 'breakfast') {
    pool.push({
      title: 'Egg on toast with avocado',
      description: 'A classic balanced breakfast — carbs, protein and satisfying fat in one.',
      time: '10 minutes',
      effort: 'Minimal effort',
    });
  }

  if (context === 'late-night') {
    pool.push({
      title: 'Warm milk with honey & oats',
      description: 'Gentle, comforting and easy on the stomach for a late snack.',
      time: '5 minutes',
      effort: 'Minimal effort',
    });
    pool.push({
      title: 'Banana with peanut butter',
      description: 'Simple, satisfying and ready in seconds.',
      time: '2 minutes',
      effort: 'No cook',
    });
  }

  // Fallback
  if (pool.length === 0) {
    pool.push(
      {
        title: 'Crackers with cheese & fruit',
        description: 'A quick, balanced snack plate — carbs, fat and produce in minutes.',
        time: '2 minutes',
        effort: 'No cook',
      },
      {
        title: 'Peanut butter on toast',
        description: 'A reliable, satisfying option that works almost any time of day.',
        time: '3 minutes',
        effort: 'No cook',
      },
    );
  }

  return pool.slice(0, 4);
}

// ─── Eating Out Pairings ─────────────────────────────────────────────────────

export interface EatingOutSuggestion {
  pairing: string;
  reasoning: string;
}

export function buildEatingOutSuggestions(
  food: string,
  cuisine: string,
): EatingOutSuggestion[] {
  const normalized = normalizeText(food);
  if (normalized.includes('burger') || normalized.includes('hamburger')) {
    return [
      { pairing: 'Side salad or coleslaw', reasoning: 'Adds fibre and produce to balance the meal.' },
      { pairing: 'Swap fries for a baked potato', reasoning: 'Still satisfying, with more fibre.' },
      { pairing: 'Add a glass of water or sparkling water', reasoning: 'Helps with fullness and hydration.' },
    ];
  }
  if (normalized.includes('pizza')) {
    return [
      { pairing: 'Add extra vegetable toppings', reasoning: 'More produce and fibre without changing what you love.' },
      { pairing: 'Start with a small side salad', reasoning: 'Fibre first helps you feel more satisfied.' },
      { pairing: 'Opt for a protein topping like grilled chicken or extra cheese', reasoning: 'Protein helps the meal keep you fuller.' },
    ];
  }
  if (normalized.includes('sushi') || normalized.includes('japanese')) {
    return [
      { pairing: 'Miso soup', reasoning: 'Warming and hydrating — a great side for sushi.' },
      { pairing: 'Edamame', reasoning: 'Plant protein and fibre as a starter.' },
    ];
  }
  // Generic
  return [
    { pairing: 'Ask for extra vegetables or salad on the side', reasoning: 'Easy fibre and volume addition.' },
    { pairing: 'Add a protein-rich side if available', reasoning: 'Protein helps the meal stay with you longer.' },
    { pairing: 'Keep what you love — these are optional ideas', reasoning: 'You know what works for you.' },
  ];
}
