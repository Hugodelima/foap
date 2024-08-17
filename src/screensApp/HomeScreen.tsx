import React, { Component } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import {useAuth, useUser} from '@clerk/clerk-expo'

import { useRoute } from '@react-navigation/native';
import { UserBD } from '../navigation/types';

export default function HomeScreen(){
  const {signOut} = useAuth()
  const { user } = useUser()

  const route = useRoute();
  const { UserBD = {} as UserBD } = route.params as { UserBD?: UserBD }; // Desestrutura a propriedade UserBD dentro de route.params, somente para ter a sugestão do ponto na hora que for digitar!, que complicado :C, passei 20 minutos nesta bomba
  
    return (
      <View>
        <Text> textInComponent </Text>
        <TouchableOpacity onPress={() => signOut()} className='bg-slate-600'>
          <Text>Sair - Logout</Text>
          <Text> Hello {user?.emailAddresses[0].emailAddress ===null}{user?.fullName} </Text>
          <Text>{UserBD.data_criacao}</Text>
        </TouchableOpacity>
      </View>
    )
}
