import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View, DevSettings } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuth, useUser} from '@clerk/clerk-expo'

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
      <View>
        <TouchableOpacity onPress={() => loggedGoogle === true ? signOut(): signOutBD()} className='bg-slate-600'>
          <Text>Sair - Logout</Text>
        </TouchableOpacity>
      </View>
    )
  
}

