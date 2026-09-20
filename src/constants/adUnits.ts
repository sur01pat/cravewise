/**
 * AdMob unit IDs for CraveWise — com.cravewise.app
 *
 * AdMob App ID (in AndroidManifest.xml): ca-app-pub-1122116225493671~4131510172
 *
 * Each placement must have its OWN unit ID from AdMob console:
 *   https://apps.admob.com → Apps → CraveWise → Ad units
 *
 * To create a new Banner unit:
 *   Ad units → Add ad unit → Banner → give it the name below → copy the ID
 *
 * TEST IDs (for development / debug builds only):
 *   Android Banner test ID: ca-app-pub-3940256099942544/6300978111
 */

const IS_DEV = __DEV__;

// ─── Test IDs (used in debug builds automatically) ────────────────────────────
const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';

// ─── Production unit IDs — paste your real IDs from AdMob console ─────────────
// Replace each placeholder with the real unit ID for that placement.
const PROD_UNITS = {
  /** Home Dashboard banner */
  bannerHome:      'ca-app-pub-1122116225493671/4173243326',

  /** Recommendation Result banner */
  bannerResult:    'ca-app-pub-1122116225493671/3251043896',

  /** I'm Hungry Now results banner */
  bannerHungry:    'ca-app-pub-1122116225493671/7760389685',

  /** Here's What I Have results banner */
  bannerPantry:    'ca-app-pub-1122116225493671/1905427775',

  /** Eating Out results banner */
  bannerEatingOut: 'ca-app-pub-1122116225493671/9592346107',
};

/**
 * Exported ad units — automatically uses test IDs in debug builds,
 * real IDs in release builds.
 */
export const AdUnits = IS_DEV
  ? {
      bannerHome:      TEST_BANNER,
      bannerResult:    TEST_BANNER,
      bannerHungry:    TEST_BANNER,
      bannerPantry:    TEST_BANNER,
      bannerEatingOut: TEST_BANNER,
    }
  : PROD_UNITS;
