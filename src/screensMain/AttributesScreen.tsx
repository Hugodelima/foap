import React, { PureComponent, useState } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

import edit_image from '../assets/images/status/edit.png'
import str_image from '../assets/images/status/str.png'
import up_image from '../assets/images/status/up.png'
import bottom_image from '../assets/images/status/bottom.png'

export default function AttributesScreen(){ 

  const navigation = useNavigation<NavigationProps>();
  const [selectedSection, setSelectedSection] = useState<string>('mental');
  
    return (
      <View className="flex-1 bg-neutral-900">
        <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
          <View className=''>
            <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4'>
                <ArrowLeftIcon size='30' color='black' />
            </TouchableOpacity>
            
          </View>
          <Text className='font-vt323 text-white mt-4 ml-4 text-xl'>Atributos</Text>
        </SafeAreaView>
        <View className='flex-row gap-4 m-4'>
          <TouchableOpacity onPress={()=> setSelectedSection('mental')}>
            <Text
              className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'mental' ? 'bg-fuchsia-700' : 'bg-transparent'}`}
            >
              Mental
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=> setSelectedSection('fisico')}>
            <Text
              className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'fisico' ? 'bg-fuchsia-700' : 'bg-transparent'}`}
            >
              Físico  
            </Text>
          </TouchableOpacity>
        </View>

        <View className='flex-1'>
          {selectedSection === 'mental' &&([
            <View className='flex-row flex-wrap m-4
            '>  
              <View className='flex-row items-center gap-1'>
                <Image source={str_image} className='w-10 h-10'/>
                <Text className='text-white font-vt323'>STR: 434 </Text>
                <TouchableOpacity>
                  <Image source={up_image} className='w-8 h-8'/>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={bottom_image} className='w-8 h-8'/>
                </TouchableOpacity>
              </View>
              <View className='flex-row items-center gap-1 m-1'>
                <Image source={str_image} className='w-10 h-10'/>
                <Text className='text-white font-vt323'>STR: 434 </Text>
                <TouchableOpacity>
                  <Image source={up_image} className='w-8 h-8'/>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={bottom_image} className='w-8 h-8'/>
                </TouchableOpacity>
              </View>
              <View className='flex-row items-center gap-1'>
                <Image source={str_image} className='w-10 h-10'/>
                <Text className='text-white font-vt323'>STR: 434 </Text>
                <TouchableOpacity>
                  <Image source={up_image} className='w-8 h-8'/>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={bottom_image} className='w-8 h-8'/>
                </TouchableOpacity>
              </View>
              <View className='flex-row items-center gap-1 m-1'>
                <Image source={str_image} className='w-10 h-10'/>
                <Text className='text-white font-vt323'>STR: 434 </Text>
                <TouchableOpacity>
                  <Image source={up_image} className='w-8 h-8'/>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={bottom_image} className='w-8 h-8'/>
                </TouchableOpacity>
              </View>
              
            </View>
            
            

          ])}
          {selectedSection === 'fisico' &&([
            
          ])}

          <View className='flex-row items-center justify-between m-4'>
            <Text className='text-white font-vt323'>Pontos Dísponiveis: er</Text>

            <TouchableOpacity onPress={()=> console.log('2')}>
              <Image source={edit_image} className='w-10 h-10'/>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    )
  
}


