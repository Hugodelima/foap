import React, { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import {useAuth, useUser} from '@clerk/clerk-expo'

export default function HomeScreen(){
  const {signOut} = useAuth()
  const { user } = useUser()
  
    return (
      <View>
        <Text> textInComponent </Text>
        <TouchableOpacity onPress={() => signOut()} className='bg-slate-600'>
          <Text>Sair - Logout</Text>
          <Text> Hello {user?.emailAddresses[0].emailAddress}|{user?.fullName} </Text>
        </TouchableOpacity>
      </View>
    )
}
