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
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

const App = () => {
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
  const data:any = await AsyncStorage.getItem("isLoggedIn")
  setIsLoggedIn(data)
}

useEffect(() => {
  setDataFromStatusLogin();
}, []);

  console.log('async do cadastro'+isLoggedIn);

  return (
  <NavigationContainer>
    <ClerkProvider tokenCache={tokenCache}  publishableKey={publishableKey}>
        <SignedIn>
          <BottomNavigation/>
        </SignedIn>
        <SignedOut>
          {isLoggedIn ? <BottomNavigation/> : <AuthNavigation/>}
        </SignedOut>
    </ClerkProvider>

  </NavigationContainer>
  )
};

export default App;