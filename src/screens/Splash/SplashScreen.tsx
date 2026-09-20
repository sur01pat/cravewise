import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

/**
 * Animated launch screen.
 *
 * Sequence (total ~2.6 s):
 *   0 ms   — screen appears (orange bg)
 *   200 ms — logo icon fades + scales in
 *   550 ms — app name slides up and fades in
 *   950 ms — tagline fades in
 *  1400 ms — sub-tagline fades in
 *  2200 ms — entire screen fades out → onFinish()
 */
export default function SplashScreen({ onFinish }: Props) {
  // Animation values
  const bgOpacity    = useRef(new Animated.Value(1)).current;
  const logoScale    = useRef(new Animated.Value(0.6)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const nameY        = useRef(new Animated.Value(18)).current;
  const nameOpacity  = useRef(new Animated.Value(0)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const subTaglineOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo appears
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      // 2. App name slides up
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(nameY, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),

      // 3. Tagline fades in
      Animated.delay(200),
      Animated.timing(taglineOp, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      // 4. Sub-tagline fades in
      Animated.delay(200),
      Animated.timing(subTaglineOp, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),

      // 5. Hold for reading
      Animated.delay(900),

      // 6. Fade entire screen out → hand off to app
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: bgOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Text style={styles.logoEmoji}>🥗</Text>
      </Animated.View>

      {/* App name */}
      <Animated.Text
        style={[
          styles.appName,
          { opacity: nameOpacity, transform: [{ translateY: nameY }] },
        ]}
      >
        CraveWise
      </Animated.Text>

      {/* Primary tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOp }]}>
        Inspired by Abbey's{'\n'}Hunger Crushing Combo framework
      </Animated.Text>

      {/* Secondary tagline */}
      <Animated.Text style={[styles.subTagline, { opacity: subTaglineOp }]}>
        Eat what you want.{'\n'}Make it work better for you.
      </Animated.Text>

      {/* Bottom brand dot row */}
      <Animated.View style={[styles.dotRow, { opacity: subTaglineOp }]}>
        <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
        <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    paddingHorizontal: Spacing.xl,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoEmoji: {
    fontSize: 52,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Typography.fontSizeMD,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    fontWeight: Typography.fontWeightMedium,
  },
  subTagline: {
    fontSize: Typography.fontSizeLG,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: Typography.fontWeightBold,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    bottom: 64,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
