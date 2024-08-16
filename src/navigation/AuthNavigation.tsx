import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import React, { Component } from 'react'
import { Text, View } from 'react-native'

import WelcomeScreen from '../screensAuth/WelcomeScreen';
import LoginScreen from '../screensAuth/LoginScreen';
import SignUpScreen from '../screensAuth/SignUpScreen';

const Stack = createNativeStackNavigator();


export default function AppNavigation() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Welcome'>
            <Stack.Screen name='Welcome' options={{headerShown: false}} component={WelcomeScreen} />
            <Stack.Screen name='Login' options={{headerShown: false}} component={LoginScreen} />
            <Stack.Screen name='SignUp' options={{headerShown: false}} component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  
}