import React, { useEffect, useState } from 'react';
import {} from 'react-native/Libraries/NewAppScreen';
import { Text } from 'react-native';


import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'

import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';

import BottomNavigation from './src/navigation/BottomNavigation';
import AuthNavigation from './src/navigation/AuthNavigation';

import AsyncStorage from '@react-native-async-storage/async-storage';
import VerificationScreen from './src/screensAuth/VerificationScreen';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

import { useFonts } from 'expo-font';

const App = () => {

  let [fontsLoaded] = useFonts({
    'VT323': require('./src/assets/fonts/VT323-Regular.ttf')
  }) 

  //token que serve apenas para autenticação do google 
  const tokenCache = {
    async getToken(key: string){
        try {
            return SecureStore.getItemAsync(key);
        } catch (error) {
            return null
        }
    },
    
    async saveToken(key:string, value:string){
        try {
            return SecureStore.setItemAsync(key,value);
        } catch (error) {
            return;
        }
    }
  }

  const [isLoggedIn,setIsLoggedIn] = useState('')

  async function setDataFromStatusLogin() {
    const data_logged:any = await AsyncStorage.getItem("isLoggedIn")
    setIsLoggedIn(data_logged)
  }

  useEffect(() => {
    setDataFromStatusLogin();
  }, []);
  
  return (
  <NavigationContainer>
    <ClerkProvider tokenCache={tokenCache}  publishableKey={publishableKey}>
        <SignedIn>
          <BottomNavigation/>
        </SignedIn>
        <SignedOut>
          {
            (() =>{
              if (isLoggedIn){
                return <BottomNavigation/>
              }else{
                return <AuthNavigation />
              }
            })()
          }
        </SignedOut>
    </ClerkProvider>

  </NavigationContainer>
  )
};

export default App;