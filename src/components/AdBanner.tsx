/**
 * AdBanner component — wraps react-native-google-mobile-ads BannerAd.
 *
 * Features:
 *  • Does not render until AdMob SDK has finished initialising (no race condition)
 *  • Hides itself completely if the ad fails to load (non-intrusive)
 *  • Auto-dismisses the "Loading ad…" placeholder after 15 s if neither
 *    onAdLoaded nor onAdFailedToLoad fires (silent timeout protection)
 *  • Clearly labels the ad per PRD requirement
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { Colors, Typography, Spacing, Radii } from '../constants/theme';
import { AdUnits } from '../constants/adUnits';

interface Props {
  /** Which ad slot to use. Defaults to 'bannerHome'. */
  slot?: keyof typeof AdUnits;
  /** Must be true before the banner tries to fetch an ad. Pass the value
   *  from App.tsx so we never request an ad before initialize() resolves. */
  adsInitialized?: boolean;
}

export function AdBanner({ slot = 'bannerHome', adsInitialized = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unitId = AdUnits[slot];

  // Start a 15-second watchdog once the SDK is ready.
  // If neither callback fires the placeholder will silently disappear.
  useEffect(() => {
    if (!adsInitialized) return;
    timeoutRef.current = setTimeout(() => {
      if (!loaded) {
        console.log('[AdBanner] timeout — hiding placeholder');
        setFailed(true);
      }
    }, 15_000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [adsInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Don't render at all until the SDK has initialised
  if (!adsInitialized) return null;

  // If ad failed (or timed out), render nothing — never break the UI for an ad
  if (failed) return null;

  return (
    <View style={styles.wrapper}>
      {/* "Ad" label — PRD requires ads to be clearly distinguishable */}
      <View style={styles.labelRow}>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>Ad</Text>
        </View>
        <Text style={styles.sponsoredText}>Sponsored</Text>
      </View>

      {/* Placeholder skeleton shown while ad is loading */}
      {!loaded && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Loading ad…</Text>
        </View>
      )}

      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          networkExtras: {},
        }}
        onAdLoaded={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setLoaded(true);
        }}
        onAdFailedToLoad={(error: { message: string }) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          console.log('[AdBanner] failed to load:', error.message);
          setFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingTop: 5,
    paddingBottom: 3,
  },
  adBadge: {
    backgroundColor: Colors.border,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  adBadgeText: {
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  sponsoredText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textLight,
  },
  placeholder: {
    width: 320,
    height: 50,
    backgroundColor: Colors.border,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: Typography.fontSizeXS,
    color: Colors.textLight,
  },
});
