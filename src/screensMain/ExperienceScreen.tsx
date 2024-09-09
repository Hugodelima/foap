import React, { PureComponent } from 'react'
import { Text, View, Image, Button, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
export default function ExperienceScreen(){ 
  const navigation = useNavigation<NavigationProps>();
    return (
      <SafeAreaView className='absolute top-8'>
        <View>
            <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4 absolute'>
                <ArrowLeftIcon size='35' color='black' />
            </TouchableOpacity>
        </View>
        <Text>experience</Text>
      </SafeAreaView>
    )
  
}


