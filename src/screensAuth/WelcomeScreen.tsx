
import React, { Component } from 'react'
import { Text, View,Image, TouchableOpacity } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import {NavigationProps} from '../navigation/types'
import {useNavigation} from '@react-navigation/native'

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProps>();
    return (
      <SafeAreaView className='flex-1 bg-gray-500'>
        <View className='flex-1 flex justify-around my-4'>
          <Text className='text-white font-bold text-4xl text-center'>Vamos Começar!</Text>
        </View>
        <View className='flex-row justify-center'>
          <Image 
            source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/noise-pollution-11522291-9375107.png?f=webp' }}
            style={{width: '100%', height: 350, marginBottom: 60}}
          />
        </View>
        <View className='space-y-4'>
          <TouchableOpacity onPress={()=>navigation.navigate('SignUp')} className='py-3 bg-blue-500 mx-7 rounded-xl'>
            <Text className='text-xl font-bold text-center text-gray-700'>Registrar</Text>
          </TouchableOpacity>
            <View className='flex-row justify-center mb-10'>
                <Text className='text-white font-semibold'>Já tem uma Conta? </Text>
                <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                  <Text className='font-bold text-blue-500'>Entrar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </SafeAreaView>
    )
  
}