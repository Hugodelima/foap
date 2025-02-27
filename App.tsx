import React, { useEffect, useState } from 'react';
import {} from 'react-native/Libraries/NewAppScreen';
import { Text } from 'react-native';

import { Slot } from 'expo-router'

import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';

import BottomNavigation from './src/navigation/BottomNavigation';
import MainNavigation from './src/navigation/MainNavigation'
import AuthNavigation from './src/navigation/AuthNavigation';

import AsyncStorage from '@react-native-async-storage/async-storage';
import VerificationScreen from './src/screensAuth/VerificationScreen';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

const App = () => {

  let [fontsLoaded] = useFonts({
    'VT323': require('./src/assets/fonts/VT323-Regular.ttf')
  }) 


  const [isLoggedIn,setIsLoggedIn] = useState('')

  async function setDataFromStatusLogin() {
    const data_logged:any = await AsyncStorage.getItem("isLoggedIn")
    setIsLoggedIn(data_logged)
  }

  useEffect(() => {
    setDataFromStatusLogin();
    //AsyncStorage.setItem('emailVerificationStatus', 'false'); // Marca a verificação como pendente
  }, []);
  
  console.log('status de logado: '+isLoggedIn)
  return (
  <NavigationContainer>
    <StatusBar />
    {
      (() =>{
        if (isLoggedIn){
          return <MainNavigation/>
        }else{
          return <AuthNavigation/>
        }
      })()
    }

  </NavigationContainer>
  )
};

export default App;
