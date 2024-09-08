import React, { Component, useEffect, useState } from 'react'
import { DevSettings, Text, TouchableOpacity, View, Image } from 'react-native'

import { useNavigation } from '@react-navigation/native';
import {NavigationProps} from '../navigation/types'

import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

import gold_image from '../assets/images/home/gold.png';
import levelUp_image from '../assets/images/home/levelUp_home.png';
import nivel_image from '../assets/images/home/nivel_home.png';
import rank_image from '../assets/images/home/rank_home.png';

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
      <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>
        <SafeAreaView className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            style={{ width: 50, height: 50, marginRight: 10 }} 
          />
          <View>
            <View className='flex-row items-center mb-2'>
              <Image source={rank_image} style={{ width: 35, height: 30}} />
              <Text className='text-white font-vt323'>Rank: {userID}</Text>
            </View>
            <View className='flex-row items-center mb-2'>
              <Image source={nivel_image} style={{ width: 30, height: 30, marginRight: 5}} />
              <Text className='text-white font-vt323'>Nível: {userID}</Text>
            </View>
            <View className='flex-row items-center mb-2'>
              <Image source={levelUp_image} style={{ width: 30, height: 30, marginRight: 5}} />
              <Text className='text-white font-vt323'>Próximo Nível: {userID}</Text>
            </View>
            <View className='flex-row items-center'>
              <Image source={gold_image} style={{ width: 30, height: 30, marginRight: 5}} />
              <Text className='text-white font-vt323'>Ouro: {userID}</Text>
            </View>
          </View>
        </SafeAreaView>

      </View>
    )
}
