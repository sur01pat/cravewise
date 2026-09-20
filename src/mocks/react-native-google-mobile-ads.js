/**
 * Development stub for react-native-google-mobile-ads.
 *
 * This file is mapped in by metro.config.js when the native binary is absent
 * (i.e. `expo start` / Metro-only runs). It exports the same surface as the
 * real package so all imports resolve without crashing, and every component
 * renders null so ads are simply invisible during development.
 *
 * In a full native build (`expo run:ios`) metro.config.js is not needed and
 * the real native module is used instead.
 */

const React = require('react');

// No-op banner component — renders nothing
function BannerAd() {
  return null;
}

const BannerAdSize = {
  BANNER: 'BANNER',
  LARGE_BANNER: 'LARGE_BANNER',
  MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
  FULL_BANNER: 'FULL_BANNER',
  LEADERBOARD: 'LEADERBOARD',
  ADAPTIVE_BANNER: 'ADAPTIVE_BANNER',
};

const TestIds = {
  BANNER: 'ca-app-pub-3940256099942544/2934735716',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
  REWARDED: 'ca-app-pub-3940256099942544/1712485313',
};

const MobileAds = () => ({
  initialize: () => Promise.resolve([]),
  setRequestConfiguration: () => Promise.resolve(),
});

module.exports = {
  __esModule: true,
  default: MobileAds,
  BannerAd,
  BannerAdSize,
  TestIds,
  MobileAds,
  InterstitialAd: { createForAdRequest: () => ({ load: () => {}, show: () => {}, addAdEventListener: () => () => {} }) },
  RewardedAd: { createForAdRequest: () => ({ load: () => {}, show: () => {}, addAdEventListener: () => () => {} }) },
  AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed', OPENED: 'opened' },
  RewardedAdEventType: { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' },
};
