import React from 'react';
import {} from 'react-native/Libraries/NewAppScreen';
import { Text } from 'react-native';

import AppNavigation from './src/navigation/AuthNavigation';

import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'

import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';

import TabNavigation from './src/navigation/AppNavigation'
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

  return (
    //este return serve apenas para autenticação com o google
    <ClerkProvider tokenCache={tokenCache}  publishableKey={publishableKey}>
      <SignedIn>
        <NavigationContainer>
          <TabNavigation/>
        </NavigationContainer>
      </SignedIn>
      <SignedOut>
        <AppNavigation/>
      </SignedOut>
    </ClerkProvider>
  )
    
};

export default App;