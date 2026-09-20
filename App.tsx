import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/Splash/SplashScreen';

// Suppress the LogBox overlay — never visible to end users.
LogBox.ignoreAllLogs();

/**
 * Context so any screen can read whether AdMob has finished initialising,
 * and pass that value down to <AdBanner adsInitialized={...} />.
 */
export const AdsContext = createContext<boolean>(false);
export function useAdsInitialized() {
  return useContext(AdsContext);
}

/**
 * Initialise AdMob once on app start.
 *
 * Test device ID (Samsung SM-A556E): 62FE899EE84663EABBE75923A50BA03A
 * AdMob logs this ID on first launch — register it so test ads render
 * on the physical device during development.
 */
async function initAds(): Promise<void> {
  await mobileAds().setRequestConfiguration({
    testDeviceIdentifiers: __DEV__
      ? ['62FE899EE84663EABBE75923A50BA03A']
      : [],
    maxAdContentRating: MaxAdContentRating.PG,
  });
  await mobileAds().initialize();
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    initAds()
      .then(() => setAdsReady(true))
      .catch((e) => {
        console.log('[Ads] init error:', e);
        // Even on error, unblock banners — they'll fail gracefully via onAdFailedToLoad
        setAdsReady(true);
      });
  }, []);

  return (
    <AdsContext.Provider value={adsReady}>
      <View style={styles.root}>
        <NavigationContainer>
          <StatusBar style={splashDone ? 'dark' : 'light'} />
          <AppNavigator />
        </NavigationContainer>

        {!splashDone && (
          <SplashScreen onFinish={() => setSplashDone(true)} />
        )}
      </View>
    </AdsContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
