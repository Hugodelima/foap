import React, { PureComponent, useState } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

export default function ConfigurationScreen(){ 

  const navigation = useNavigation<NavigationProps>();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  
    return (
    <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>

      <SafeAreaView>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()} className='bg-cyan-500 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4 absolute'>
              <ArrowLeftIcon size='35' color='black' />
          </TouchableOpacity>
        </View>
        <View className='items-center mt-4'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            className="w-28 h-28 mr-3"
          />
        </View>
        <View className='flex-row ml-4 items-center'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            className="w-14 h-14 mr-3"
          />
          <TouchableOpacity onPress={() => navigation.navigate('ChangeUserDataScreen')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323 text-white'>Dados Cadastrais</Text>
            <Text className='font-vt323 text-neutral-300'>Email, Senha</Text>
          </TouchableOpacity>
        </View>
        <View className='flex-row ml-4 items-center'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            className="w-14 h-14 mr-3"
          />
          <Text className='text-white font-vt323'>Habilitar Notificação</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <View className='flex-row ml-4 items-center'>
          <Image 
            source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
            className="w-14 h-14 mr-3"
          />
          <Text className='text-white font-vt323'>Alterar Tema</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </SafeAreaView>
    </View>


       
      
    )
  
}
