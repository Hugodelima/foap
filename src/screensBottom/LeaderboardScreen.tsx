import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View, Image} from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

export default function LeaderboardScreen(){
  
  return (
    <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>
      <SafeAreaView className='mt-4'>
        <Text className='font-vt323 text-center text-white text-4xl'>Rank F</Text>
        <Text className='font-vt323 text-white text-center text-sm '>Para avançar para o próximo o rank será necessário ter um total de XP 4344</Text>

        <Text className='font-vt323 text-center text-white text-2xl mt-4'>Top 20</Text>
        <View className='gap-4'>
          <View className='flex-row items-center justify-center gap-4'>
            <Text className='font-vt323 text-white'>1°</Text>
            <Image 
              source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
              style={{ width: 50, height: 50, justifyContent: 'center' }} 
            />
            <Text className='font-vt323 text-white'>Pedrinho matador de onça</Text>
            <Text className='font-vt323 text-white'>1000 XP</Text>
          </View>
          <View className='flex-row items-center justify-center gap-4'>
            <Text className='font-vt323 text-white'>2°</Text>
            <Image 
              source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
              style={{ width: 50, height: 50, justifyContent: 'center' }} 
            />
            <Text className='font-vt323 text-white'>Pedrinho matador de onça</Text>
            <Text className='font-vt323 text-white'>1000 XP</Text>
          </View>
          <View className='flex-row items-center justify-center gap-4'>
            <Text className='font-vt323 text-white'>3°</Text>
            <Image 
              source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
              style={{ width: 50, height: 50, justifyContent: 'center' }} 
            />
            <Text className='font-vt323 text-white'>Pedrinho matador de onça</Text>
            <Text className='font-vt323 text-white'>1000 XP</Text>
          </View>
          <View className='flex-row items-center justify-center gap-4'>
            <Text className='font-vt323 text-white'>4°</Text>
            <Image 
              source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
              style={{ width: 50, height: 50, justifyContent: 'center' }} 
            />
            <Text className='font-vt323 text-white'>Pedrinho matador de onça</Text>
            <Text className='font-vt323 text-white'>1000 XP</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
  
}


