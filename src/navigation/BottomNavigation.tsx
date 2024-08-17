import React, { Component } from 'react'
import { Text, View } from 'react-native'

import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screensApp/HomeScreen'
import ConfigScreen from '../screensApp/ConfigScreen'
import ReportScreen from '../screensApp/ReportScreen'
import AuthNavigation from './AuthNavigation';

const Tab = createBottomTabNavigator();

export default function BottomNavigation(){
    return (
      <Tab.Navigator>
        <Tab.Screen name='HomeScreen' component={HomeScreen} />
        <Tab.Screen name='ConfigScreen' component={ConfigScreen} />
        <Tab.Screen name='ReportScreen' component={ReportScreen} />
        
      </Tab.Navigator>
    )
}
