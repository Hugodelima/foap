import React, { PureComponent } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

import levelUp_image from '../assets/images/home/levelUp_home.png';
import xp_image from '../assets/images/mission/xp.png';
import xpFaltante_image from '../assets/images/experience/xp_without.png'

import { useFetchUserData } from '../hooks/useFetchDataUser';


export default function ExperienceScreen(){ 
  
  const navigation = useNavigation<NavigationProps>();
  const { userData, error } = useFetchUserData();

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <View className=''>
          <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4'>
              <ArrowLeftIcon size='30' color='black' />
          </TouchableOpacity>
          
        </View>
        <Text className='font-vt323 text-white mt-4 ml-4 text-xl'>Experiência</Text>
      </SafeAreaView>
      <View className='items-center m-4'>
        <Image 
          source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
          className="w-12 h-12 mr-3"
        />
        <View className="flex-row items-center mb-2">
          <Image source={levelUp_image} className="w-7 h-7 mr-1" />
          <Text className="text-white font-vt323">Próximo Nível: {userData?.proximo_nivel}</Text>
        </View>
        <View className='flex-row items-center'>
          <Image source={xpFaltante_image} style={{ width: 30, height: 30, marginRight: 5 }} />
          <Text className='text-white font-vt323'>Quantidade de XP para subir de nível: {userData?.total_xp}</Text>
        </View>
        <View className='flex-row items-center'>
          <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5 }} />
          <Text className='text-white font-vt323'>Total de Experiência: {userData?.total_xp}</Text>
        </View>

       
    
      </View>
    </View>
  )
  
}


