import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import React, { Component } from 'react'
import { Text, View } from 'react-native'

import WelcomeScreen from '../screensAuth/WelcomeScreen';
import LoginScreen from '../screensAuth/LoginScreen';
import SignUpScreen from '../screensAuth/SignUpScreen';
import VerificationScreen from '../screensAuth/VerificationScreen'
import ResetPasswordScreen from '../screensAuth/ResetPasswordScreen'

import { SQLiteProvider ,useSQLiteContext} from 'expo-sqlite';
import BottomNavigation from './BottomNavigation';

import {useBackButtonHandler} from '../hooks/useBackButtonHandler'

const Stack = createNativeStackNavigator();

export default function AuthNavigation() {

    useBackButtonHandler();

    return (
        <NavigationContainer independent={true}>
          <Stack.Navigator initialRouteName='Welcome'>
              <Stack.Screen name='Welcome' options={{headerShown: false}} component={WelcomeScreen} />
              <Stack.Screen name='Login' options={{headerShown: false}} component={LoginScreen} />
              <Stack.Screen name='SignUp' options={{headerShown: false}} component={SignUpScreen} />
              <Stack.Screen name="VerificationScreen" options={{headerShown: false}} component={VerificationScreen} />
              <Stack.Screen name="ResetPasswordScreen" options={{headerShown: false}} component={ResetPasswordScreen} />

              <Stack.Screen name='BottomNavigation' options={{headerShown: false}} component={BottomNavigation} />
          </Stack.Navigator>
        </NavigationContainer>
    )
  
}


