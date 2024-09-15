import React, { PureComponent, useState } from 'react'
import { Text, TouchableOpacity, View, DevSettings, Image } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth, useUser} from '@clerk/clerk-expo'

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';

import { SafeAreaView } from 'react-native-safe-area-context'
import ModalComponent from '../modal/moreOptions';
import moreOptions_image from '../assets/images/home/more_options.png';

export default function ReportScreen(){

  async function signOutBD(){
    await AsyncStorage.setItem('isLoggedIn','')
    DevSettings.reload()
  }
  /*
  <Text> Hello {user?.emailAddresses[0].emailAddress ===null}{user?.fullName} </Text>
  */
  //do google
  const {signOut} = useAuth()
  const { user } = useUser()
  const loggedGoogle = useAuth().isSignedIn
  const [modalVisible, setModalVisible] = useState(false);
  
  const navigation = useNavigation<NavigationProps>();
  
  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };
  
    return (
      <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>
        <SafeAreaView className='gap-8 mt-6'>
          <TouchableOpacity onPress={() => console.log('1')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323'>Relatório de Missões</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('2')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323'>Relatório de Recompensas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('3')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323'>Relatório de Penalidades</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('4')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323'>Relatório de Ouro</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('5')} className='bg-cyan-500 rounded-full p-3 font-vt323'>
            <Text className='font-vt323'>Relatório de Atributos</Text>
          </TouchableOpacity> 




          <TouchableOpacity onPress={() => loggedGoogle === true ? signOut(): signOutBD()} className='bg-cyan-500 rounded-full p-3'>
            <Text className='font-vt323'>Sair - Logout</Text>
          </TouchableOpacity>

          
        
        </SafeAreaView>
        <TouchableOpacity
            className="absolute right-4 top-12"
            onPress={() => setModalVisible(true)}
          >
            <Image 
              source={moreOptions_image} 
              className="w-7 h-7"
            />
          </TouchableOpacity>

          <ModalComponent 
            visible={modalVisible} 
            onClose={() => setModalVisible(false)} 
            onNavigate={handleNavigate}
          />
      </View>
    )
  
}

