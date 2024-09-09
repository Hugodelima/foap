import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View, DevSettings } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth, useUser} from '@clerk/clerk-expo'

import { SafeAreaView } from 'react-native-safe-area-context'
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
  
    return (
      <View style={{flex: 1, backgroundColor: '#1C1C1E' }}>
        <SafeAreaView className='gap-8 mt-4'>
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
      </View>
    )
  
}

