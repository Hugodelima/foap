import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalComponent from '../modal/moreOptions';

import gold_image from '../assets/images/home/gold.png';
import levelUp_image from '../assets/images/home/levelUp_home.png';
import nivel_image from '../assets/images/home/nivel_home.png';
import rank_image from '../assets/images/home/rank_home.png';
import moreOptions_image from '../assets/images/home/more_options.png';
import { NavigationProps } from '../navigation/types';

export default function HomeScreen(){
  const [userID, setUserID] = useState('');
  const [modalVisible, setModalVisible] = useState(false); 

  useEffect(() => {
    async function getIDUser(){
      const userID:any = await SecureStore.getItemAsync('userStorageID')
      setUserID(userID)
    }
    getIDUser();
  }, []);

  const navigation = useNavigation<NavigationProps>();

  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <Image 
          source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
          className="w-12 h-12 mr-3"
        />
        <View>
          <View className="flex-row items-center mb-2">
            <Image source={rank_image} className="w-9 h-8" />
            <Text className="text-white font-vt323 ml-2">Rank: {userID}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={nivel_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Nível: {userID}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={levelUp_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Próximo Nível: {userID}</Text>
          </View>
          <View className="flex-row items-center">
            <Image source={gold_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Ouro: {userID}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="absolute right-4 top-12"
          onPress={() => setModalVisible(true)}
        >
          <Image 
            source={moreOptions_image} 
            className="w-7 h-7"
          />
        </TouchableOpacity>
      </SafeAreaView>

      <ModalComponent 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onNavigate={handleNavigate}
      />
    </View>
  );
}
