/**
 * Client-side topic guardrail for CraveWise — Abbey's Kitchen / Hunger Crushing Combo app.
 *
 * Strategy: ALLOWLIST-FIRST (strict opt-in).
 *   The input must contain at least one recognised food / nutrition / eating signal
 *   AND must not contain any hard-blocked term.
 *   Everything that does not match the allowlist is rejected — no exceptions.
 *
 * The server-side check in cravewise-api/src/utils/guardrails.ts is the
 * authoritative gate. This client check gives instant feedback before any
 * network request is made.
 */

// ─── Hard-block list ──────────────────────────────────────────────────────────
// Any match here rejects immediately, regardless of food signals present.

const BLOCKED_PATTERNS: RegExp[] = [
  // Adult / explicit
  /\b(porn|pornography|sex|sexy|sexual|nude|naked|nudity|explicit|erotic|nsfw|fetish|orgasm|masturbat|genital|penis|vagina|nipple|intercourse|foreplay|bdsm|kink)\b/i,
  // Violence / self-harm
  /\b(kill|murder|weapon|gun|bomb|explosive|hack|exploit|malware|ransomware|self.harm|suicide|cutting myself|hurt myself)\b/i,
  // Programming / tech
  /\b(javascript|python|typescript|sql|html|css|coding|programming|software|machine learning|ai model|llm|gpt|prompt injection|api key|git|github|devops|cloud computing)\b/i,
  // Finance
  /\b(stock market|cryptocurrency|bitcoin|ethereum|nft|investment|trading|portfolio|forex|tax return|loan|mortgage|insurance policy|hedge fund)\b/i,
  // Medical / clinical (nutrition questions are fine — drug dosages are not)
  /\b(prescription|drug dosage|chemotherapy|surgery|clinical trial|insulin dose|icd[- ]?\d|diagnos[ei]s of cancer|diagnos[ei]s of diabetes)\b/i,
  // Legal / political
  /\b(lawsuit|legal advice|attorney|court case|legislation|political party|election|vote|congress|senate|parliament)\b/i,
  // Academic dishonesty
  /\b(write my essay|do my homework|write my assignment|thesis for me|research paper for me)\b/i,
  // Personal relationships
  /\b(break up|divorce|cheating on me|relationship advice|dating app|tinder|bumble|hinge|grindr)\b/i,
  // Hate / slurs (partial match intentional — catches variants)
  /\b(racist|racism|slur|hate speech|white suprema|nazi)\b/i,
];

// ─── Allowlist: food, nutrition, eating & Abbey's Kitchen signals ─────────────
// Input MUST match at least one of these to be accepted.
// Covers everything relevant to the Hunger Crushing Combo framework.

const FOOD_ALLOWLIST: RegExp[] = [
  // Core eating / meal language
  /\b(eat|eating|ate|meal|meals|food|foods|drink|drinking|snack|snacking|breakfast|lunch|dinner|supper|brunch|bite|dish|dishes|recipe|recipes)\b/i,
  // Cooking methods
  /\b(cook|cooking|cooked|bake|baking|baked|fry|frying|fried|grill|grilling|grilled|boil|boiling|boiled|steam|steaming|steamed|roast|roasting|roasted|microwave|air.?fry|saut[eé]|poach|blanch|simmer|slow.?cook|stir.?fry)\b/i,
  // Prepared foods & bakery
  /\b(toast|avocado|smoothie|smoothies|cereal|muesli|granola|porridge|oatmeal|waffle|waffles|pancake|pancakes|crepe|crepes|muffin|muffins|bagel|croissant|donut|brownie|cookie|cookies|cake|pie|tart|pudding|ice.?cream|gelato|sorbet|scone|biscuit)\b/i,
  // Meat, fish, protein sources
  /\b(chicken|beef|pork|lamb|turkey|duck|fish|salmon|tuna|cod|shrimp|prawn|seafood|shellfish|steak|mince|bacon|ham|sausage|tofu|tempeh|seitan|egg|eggs|legume|lentil|lentils|bean|beans|chickpea|chickpeas|edamame)\b/i,
  // Dairy & alternatives
  /\b(milk|cheese|yogurt|yoghurt|cream|butter|ghee|kefir|cottage cheese|cream cheese|sour cream|dairy|plant.?milk|oat milk|almond milk|soy milk)\b/i,
  // Grains, bread, pasta
  /\b(rice|pasta|bread|noodle|noodles|oat|oats|flour|grain|grains|quinoa|couscous|barley|millet|spelt|wheat|rye|sourdough|tortilla|chapati|flatbread|pita|roti|bulgur)\b/i,
  // Vegetables
  /\b(vegetable|vegetables|veggie|veggies|spinach|kale|broccoli|carrot|carrots|onion|onions|garlic|tomato|tomatoes|potato|potatoes|sweet.?potato|pepper|peppers|cucumber|zucchini|courgette|eggplant|aubergine|celery|lettuce|cabbage|cauliflower|mushroom|mushrooms|corn|peas|asparagus|beets|beetroot|leek|artichoke|squash|pumpkin|fennel|radish)\b/i,
  // Fruit
  /\b(fruit|fruits|apple|apples|banana|bananas|orange|oranges|lemon|lemons|lime|limes|berry|berries|strawberry|strawberries|blueberry|blueberries|raspberry|raspberries|mango|mangoes|pineapple|grape|grapes|peach|peaches|plum|plums|watermelon|melon|kiwi|pear|pears|cherry|cherries|fig|figs|apricot|papaya|avocado)\b/i,
  // Pantry staples & condiments
  /\b(oil|olive.?oil|coconut.?oil|sauce|soy.?sauce|hot.?sauce|ketchup|mustard|mayo|mayonnaise|dressing|vinegar|salt|pepper|sugar|honey|maple.?syrup|jam|peanut.?butter|almond.?butter|tahini|hummus|salsa|guacamole|chutney|relish)\b/i,
  // Spices & herbs
  /\b(spice|spices|herb|herbs|cumin|coriander|turmeric|paprika|cinnamon|ginger|chilli|chili|cayenne|oregano|basil|thyme|rosemary|parsley|mint|dill|bay.?leaf|cardamom|clove|nutmeg|saffron|vanilla|garlic.?powder|onion.?powder)\b/i,
  // Nuts & seeds
  /\b(nut|nuts|seed|seeds|almond|almonds|walnut|walnuts|cashew|cashews|pecan|pecans|pistachio|peanut|peanuts|hazelnut|sunflower.?seed|pumpkin.?seed|chia|flaxseed|sesame|hemp.?seed)\b/i,
  // World cuisines & dishes
  /\b(pizza|burger|burgers|sushi|noodles|curry|curries|salad|salads|soup|soups|sandwich|sandwiches|wrap|wraps|taco|tacos|spaghetti|ramen|pho|dal|daal|chapati|stir.?fry|dumplings|gyoza|tapas|mezze|paella|risotto|falafel|shawarma|kebab|lasagne|lasagna|moussaka|tagine|biryani|pilaf|congee|bibimbap|pad.?thai|tom.?yum|tikka|masala|korma|vindaloo|chowder|gumbo|jambalaya|quesadilla|enchilada|burrito|nigiri|sashimi|tempura|udon|ravioli|gnocchi|ceviche|poke)\b/i,
  // Hunger, satiety & cravings (Abbey's framework core)
  /\b(hungry|hunger|craving|cravings|crave|satisfy|satisfying|satiety|satiated|full|fullness|appetite|thirst|snacky|peckish|famished|starving)\b/i,
  // Taste & texture
  /\b(salty|sweet|crunchy|crispy|creamy|warm|hot|cold|spicy|savoury|savory|tangy|bitter|sour|umami|chewy|light|hearty|filling|comforting|fresh|rich|smooth|velvety)\b/i,
  // Nutrition concepts — Abbey's Hunger Crushing Combo framework
  /\b(protein|carb|carbs|carbohydrate|carbohydrates|fat|fats|fibre|fiber|produce|nutrient|nutrients|vitamin|vitamins|mineral|minerals|calorie|calories|energy|portion|portions|balance|macro|macros|micronutrient|antioxidant|omega.?3|iron|calcium|zinc|magnesium|folate|b12|vitamin.?d|prebiotics?|probiotics?|gut.?health|blood.?sugar|satiety.?signal|hunger.?crushing|combo|combination)\b/i,
  // Eating context & occasions
  /\b(restaurant|cafe|cafeteria|takeaway|takeout|delivery|drive.?through|menu|order|ordering|dine|dining|dine.?in|cuisine|fast.?food|street.?food|food.?court|buffet|potluck|picnic|barbecue|bbq|meal.?prep|batch.?cook|leftovers?)\b/i,
  // Pantry / grocery / kitchen
  /\b(pantry|fridge|freezer|grocery|groceries|supermarket|store|shop|shopping|ingredient|ingredients|stock|larder|cupboard|kitchen|countertop|blender|food.?processor|instant.?pot|slow.?cooker|air.?fryer|oven|stovetop)\b/i,
  // Dietary styles & restrictions
  /\b(vegan|vegetarian|pescatarian|omnivore|gluten.?free|dairy.?free|nut.?free|halal|kosher|keto|paleo|whole.?30|low.?carb|low.?fat|low.?sodium|plant.?based|flexitarian|mediterranean.?diet|dash.?diet|allergy|allergies|intolerance|celiac|lactose)\b/i,
];

// ─── Screen-specific error messages ───────────────────────────────────────────

export const GUARDRAIL_MESSAGES = {
  eating:
    'Please describe a real meal or food — e.g. "dal rice", "avocado toast", or "cereal with milk". CraveWise only helps with food and nutrition.',
  eatingOut:
    'Please enter the food you\'re ordering — e.g. "burger", "sushi platter", or "pasta". CraveWise only suggests pairings for real food.',
  pantryItem:
    'That doesn\'t look like an ingredient. Add something from your kitchen — e.g. "eggs", "spinach", or "peanut butter".',
} as const;

export type GuardrailScreen = keyof typeof GUARDRAIL_MESSAGES;

/**
 * Returns a screen-specific error message if the input is not clearly
 * food / nutrition / eating related, or null if it passes.
 *
 * Logic (applied in order):
 *   1. Inputs < 2 chars — pass (user still typing, no signal either way).
 *   2. Hard-blocked terms — reject immediately with context message.
 *   3. No allowlisted food/nutrition signal — reject (strict opt-in).
 *   4. Everything else — pass.
 */
export function getGuardrailError(text: string, screen: GuardrailScreen): string | null {
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;

  // Step 1: hard block — always checked first, even on short words.
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) return GUARDRAIL_MESSAGES[screen];
  }

  // Step 2: strict allowlist — must match at least one food/nutrition signal.
  const isOnTopic = FOOD_ALLOWLIST.some((p) => p.test(trimmed));
  if (!isOnTopic) return GUARDRAIL_MESSAGES[screen];

  return null;
}
