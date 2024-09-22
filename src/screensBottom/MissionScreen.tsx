import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';
import moreOptions_image from '../assets/images/home/more_options.png';

import ModalComponent from '../modal/moreOptions';
import { useFetchUserData } from '../hooks/useFetchDataUser';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';

interface Reward {
  id: number;
  xp: number;
  gold: number;
  pd: number;
}

export default function MissionScreen() {
  const [modalVisibleOption, setModalVisibleOption] = useState(false);
  const [modalVisibleReward, setModalVisibleReward] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('missao');
  const { userData } = useFetchUserData();
  const [rewards, setRewards] = useState<Reward[]>([]);

  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    // Fetch rewards from the API
    const fetchRewards = async () => {
      try {
        const response = await axios.get('http://localhost:3000/rewards');
        setRewards(response.data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };

    fetchRewards();
  }, []);

  const handlePress = () => {
    console.log('Criar nova missão');
  };

  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <SafeAreaView className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500'>
        <View className='flex-row items-center mb-4'>
          <View className='flex-row items-center'>
            <Image source={gold_image} style={{ width: 30, height: 30, marginRight: 5 }} />
            <Text className='text-white font-vt323'>{userData?.ouro}</Text>
          </View>
          <View className='flex-row items-center'>
            <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5 }} />
            <Text className='text-white font-vt323'>{userData?.total_xp}</Text>
          </View>
        </View>
        <View className='flex-row gap-4 mb-4'>
          <TouchableOpacity onPress={() => setSelectedSection('missao')}>
            <Text
              className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'missao' ? 'bg-fuchsia-700' : 'bg-transparent'}`}
            >
              Missões
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedSection('recompensa')}>
            <Text
              className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'recompensa' ? 'bg-fuchsia-700' : 'bg-transparent'}`}
            >
              Recompensas
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        className="absolute right-4 top-12"
        onPress={() => setModalVisibleOption(true)}
      >
        <Image source={moreOptions_image} className="w-7 h-7" />
      </TouchableOpacity>
      


      <View className='flex-1'>
        {selectedSection === 'recompensa' && (
          <View className='flex-1'>
            <FlatList
              data={rewards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className='p-4 border-b border-neutral-700'>
                  <Text className='text-white font-vt323'>XP: {item.xp}</Text>
                  <Text className='text-white font-vt323'>Ouro: {item.gold}</Text>
                  <Text className='text-white font-vt323'>PD: {item.pd}</Text>
                  <TouchableOpacity onPress={() => handleBuyReward(item.id)}>
                    <Text className='text-white font-vt323'>Comprar Recompensa</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <View className='flex-1 justify-center items-center'>
              
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleReward}
                onRequestClose={() => {
                  Alert.alert('Modal has been closed.');
                  setModalVisibleReward(!modalVisibleReward);
              }}>
                <View>
                  <Text>21423432324</Text>
                </View>
              
                
                <Pressable
                  onPress={() => setModalVisibleReward(!modalVisibleReward)}>
                  <Text className='text-white'>Hide Modal</Text>
                </Pressable>
                
              </Modal>
            </View>
            
            
            <TouchableOpacity 
              className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5'
              onPress={() => setModalVisibleReward(true)}
            >
              <Text className='text-white text-center font-vt323'>Criar Nova Recompensa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ModalComponent 
        visible={modalVisibleOption} 
        onClose={() => setModalVisibleOption(false)} 
        onNavigate={handleNavigate} 
      />

      
    </View>
  );
}

// Função para comprar a recompensa e deduzir o ouro do usuário
const handleBuyReward = async (rewardId: number) => {
  try {
    const response = await axios.post(`http://localhost:3000/rewards/buy/${rewardId}`);
    console.log('Compra realizada com sucesso:', response.data);
    // Atualizar os dados do usuário se necessário (ouro, etc.)
  } catch (error) {
    console.error('Erro ao comprar recompensa:', error);
  }
};
