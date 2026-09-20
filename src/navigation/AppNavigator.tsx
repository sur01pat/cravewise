import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/theme';
import { RootTabParamList, HomeStackParamList } from '../types';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import EatingScreen from '../screens/Eating/EatingScreen';
import HungryNowScreen from '../screens/HungryNow/HungryNowScreen';
import WhatIHaveScreen from '../screens/WhatIHave/WhatIHaveScreen';
import EatingOutScreen from '../screens/EatingOut/EatingOutScreen';
import RecommendationResultScreen from '../screens/Eating/RecommendationResultScreen';
import ExploreScreen from '../screens/Explore/ExploreScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: {
          fontSize: Typography.fontSizeLG,
          fontWeight: Typography.fontWeightSemiBold,
          color: Colors.text,
        },
        headerTintColor: Colors.primary,
        headerBackTitle: '',
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Eating"
        component={EatingScreen}
        options={{ title: "I'm Eating" }}
      />
      <HomeStack.Screen
        name="HungryNow"
        component={HungryNowScreen}
        options={{ title: "I'm Hungry Now" }}
      />
      <HomeStack.Screen
        name="WhatIHave"
        component={WhatIHaveScreen}
        options={{ title: "Here's What I Have" }}
      />
      <HomeStack.Screen
        name="EatingOut"
        component={EatingOutScreen}
        options={{ title: 'Eating Out' }}
      />
      <HomeStack.Screen
        name="RecommendationResult"
        component={RecommendationResultScreen}
        options={{ title: 'Your Meal' }}
      />
    </HomeStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: Typography.fontWeightMedium,
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          if (route.name === 'Explore') iconName = focused ? 'compass' : 'compass-outline';
          if (route.name === 'Saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
