import React, { PureComponent } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList, DevSettings } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

import levelUp_image from '../assets/images/home/levelUp_home.png';
import xp_image from '../assets/images/mission/xp.png';
import xpFaltante_image from '../assets/images/experience/xp_without.png'

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth, useUser} from '@clerk/clerk-expo'

import { useFetchUserData } from '../hooks/useFetchDataUser';


export default function ChangeUserDataScreen(){ 
  
  const navigation = useNavigation<NavigationProps>();
  const { userData, error } = useFetchUserData();

  /*
  <Text> Hello {user?.emailAddresses[0].emailAddress ===null}{user?.fullName} </Text>
  */
  //do google

  const {signOut} = useAuth()
  const { user } = useUser()
  const loggedGoogle = useAuth().isSignedIn

  async function signOutBD(){
    await AsyncStorage.setItem('isLoggedIn','')
    DevSettings.reload()
  }

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <View className=''>
          <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4'>
              <ArrowLeftIcon size='30' color='black' />
          </TouchableOpacity>
          
        </View>
        <Text className='font-vt323 text-white mt-4 ml-4 text-xl'>Configurações Cadastrais</Text>
      </SafeAreaView>
      <View className='mt-4'>
        <Text className='font-vt323 text-white border-b-2 border-white text-2xl'>Conta</Text>
        <View className='ml-4'>
            <View>
                <Text className='font-vt323 text-white'>Nome de Usuário</Text>
                <Text className='font-vt323 text-white'>XXXXXXXXXXXXXXX</Text>
            </View>
            <View>
                <Text className='font-vt323 text-white'>E-mail</Text>
                <Text className='font-vt323 text-white'>XXXXXXXXXXXXXXX</Text>
            </View>
            <View>
                <Text className='font-vt323 text-white'>Senha</Text>
                <Text className='font-vt323 text-white'>XXXXXXXXXXXXXXX</Text>
            </View>
        </View>
        <Text className='font-vt323 text-white border-b-2 border-white text-xl'>Sair</Text>
        <View className='ml-4'>
            <TouchableOpacity onPress={() => loggedGoogle === true ? signOut(): signOutBD()} className='bg-cyan-500 rounded-full p-3 mt-4'>
                <Text className='font-vt323'>Desconectar-se</Text>
            </TouchableOpacity>
        </View>

       
    
      </View>
    </View>
  )
  
}


