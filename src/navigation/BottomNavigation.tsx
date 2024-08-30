import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screensApp/HomeScreen';
import ConfigScreen from '../screensApp/ConfigScreen';
import ReportScreen from '../screensApp/ReportScreen';

import {useBackButtonHandler} from '../hooks/useBackButtonHandler'

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  
  useBackButtonHandler();

  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="ConfigScreen" component={ConfigScreen} />
      <Tab.Screen name="ReportScreen" component={ReportScreen} />
    </Tab.Navigator>
  );
}
