import React, { PureComponent } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';

export default function MissionScreen(){ 

  const handlePress = () => {
    // Adicione a lógica para criar uma nova missão aqui
    console.log('Criar nova missão');
  };
  
    return (
      <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>
        <SafeAreaView className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500'>
          <View className='flex-row items-center'>
            <View className='flex-row items-center'>
              <Image source={gold_image} style={{ width: 30, height: 30, marginRight: 5}} />
              <Text className='text-white font-vt323'>12</Text>
            </View>
            <View className='flex-row items-center'>
              <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5}} />
              <Text className='text-white font-vt323'>1232</Text>
            </View>
          </View>
          <View className='mt-4 flex-row pb-4'>
            <Text className='text-white font-vt323'> Missões </Text>
            <Text className='text-white font-vt323'> Karma </Text>
          </View>

        </SafeAreaView>
        <View className='flex-1'>
          <Text>sgfdgfg</Text>
          <FlatList>

          </FlatList>
        </View>
        <TouchableOpacity 
          className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5'
          onPress={handlePress}
        >
          <Text className='text-white text-center font-vt323'>Criar Nova Missão</Text>
        </TouchableOpacity>
        
      </View>
    )
  
}


