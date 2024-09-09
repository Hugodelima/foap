import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigation from './BottomNavigation';

import AttributesScreen from '../screensMain/AttributesScreen';
import ConfigurationScreen from '../screensMain/ConfigurationScreen';
import ExperienceScreen from '../screensMain/ExperienceScreen';

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="BottomNavigation">
      <Stack.Screen name="BottomNavigation" component={BottomNavigation} options={{ headerShown: false }}
      />

      <Stack.Screen name='AttributesScreen' options={{ headerShown: false }} component={AttributesScreen} />
      <Stack.Screen name='ConfigurationScreen' options={{ headerShown: false }} component={ConfigurationScreen} />
      <Stack.Screen name='ExperienceScreen' options={{ headerShown: false }} component={ExperienceScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
