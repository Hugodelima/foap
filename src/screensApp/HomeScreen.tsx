import React, { Component, useEffect, useState } from 'react'
import { DevSettings, Text, TouchableOpacity, View, Image } from 'react-native'

import { useNavigation } from '@react-navigation/native';
import {NavigationProps} from '../navigation/types'

import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen(){
  
  //do login normal
  const [userID, setUserID] = useState('')

  useEffect(() => {
    async function getIDUser(){
      const userID:any = await SecureStore.getItemAsync('userStorageID')
      setUserID(userID)
    }
    getIDUser()

  }, []);

  
  const navigation = useNavigation<NavigationProps>();
    return (
      <SafeAreaView>
        <View className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            style={{ width: 50, height: 50, marginRight: 10 }} 
          />
          <View>
            <Text className='text-white font-vt323'> Rank: {userID} </Text>
            <Text className='text-white font-vt323'> Nível: {userID} </Text>
            <Text className='text-white font-vt323'> Próximo Nível: {userID} </Text>
            <Text className='text-white font-vt323'> Ouro: {userID} </Text>
          </View>
        </View>

      </SafeAreaView>
    )
}
