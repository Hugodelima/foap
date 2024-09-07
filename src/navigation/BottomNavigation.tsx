import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screensApp/HomeScreen';
import ConfigScreen from '../screensApp/ConfigScreen';
import ReportScreen from '../screensApp/ReportScreen';

import {useBackButtonHandler} from '../hooks/useBackButtonHandler'
import { Header } from 'react-native/Libraries/NewAppScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  
  useBackButtonHandler();

  return (
    <Tab.Navigator >
      <Tab.Screen name="HomeScreen" options={{ headerShown: false }} component={HomeScreen} />
      <Tab.Screen name="ConfigScreen" options={{ headerShown: false }} component={ConfigScreen} />
      <Tab.Screen name="ReportScreen" options={{ headerShown: false }} component={ReportScreen} />
    </Tab.Navigator>
  );
}
