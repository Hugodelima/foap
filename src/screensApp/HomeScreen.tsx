import React, { Component, useEffect, useState } from 'react'
import { DevSettings, Text, TouchableOpacity, View } from 'react-native'

import {useAuth, useUser} from '@clerk/clerk-expo'

import { useRoute } from '@react-navigation/native';
import { UserBD } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';
import {NavigationProps} from '../navigation/types'

import * as SecureStore from 'expo-secure-store';

export default function HomeScreen(){

  async function signOutBD(){
    await AsyncStorage.setItem('isLoggedIn','')
    DevSettings.reload()
  }
  async function getIDUser(){
    return await SecureStore.getItemAsync('userStorageID')
  }
  const navigation = useNavigation<NavigationProps>();

  const {signOut} = useAuth()
  const { user } = useUser()

  

  const loggedGoogle = useAuth().isSignedIn

  console.log("id do usuario", getIDUser()); /////////////////////////////////////////////////
  
  

    return (
      <View>
        <Text> textInComponent </Text>
        <TouchableOpacity onPress={() => loggedGoogle === true ? signOut(): signOutBD()} className='bg-slate-600'>
          <Text>Sair - Logout</Text>
        </TouchableOpacity>
        <Text> Hello {user?.emailAddresses[0].emailAddress ===null}{user?.fullName} </Text>
      </View>
    )
}
