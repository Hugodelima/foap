import React, { useState } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';

import { useFetchUserData } from '../hooks/useFetchDataUser';

import moreOptions_image from '../assets/images/home/more_options.png';
import ModalComponent from '../modal/moreOptions';

import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';

export default function MissionScreen() { 
  const [modalVisible, setModalVisible] = useState(false); 
  const [selectedSection, setSelectedSection] = useState<string>('missao');
  const { userData, error } = useFetchUserData();
  
  const navigation = useNavigation<NavigationProps>();

  const handlePress = () => {
    // Adicione a lógica para criar uma nova missão aqui
    console.log('Criar nova missão');
  };
  
  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  // Dados fictícios para FlatList //////////////////////////////////////////////////////////
  const missions = [{ id: '1', title: 'Missão 1', category: 'Categoria A', rank: 'B', difficulty: 'Fácil' }];
  const rewards = [{ id: '1', reward: 'Recompensa 1', xp: 100, gold: 50 }];
  const penalties = [{ id: '1', penalty: 'Penalidade 1', category: 'Categoria B', difficulty: 'Difícil' }];

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
          <TouchableOpacity onPress={() => setSelectedSection('penalidade')}>
            <Text
              className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'penalidade' ? 'bg-fuchsia-700' : 'bg-transparent'}`}
            >
              Penalidades
            </Text>
          </TouchableOpacity>
        </View>
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

      <View className='flex-1'>
        {selectedSection === 'missao' && (
          <FlatList
            data={missions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className='p-4 border-b border-neutral-700'>
                <Text className='text-white font-vt323'>Missão: {item.title}</Text>
                <Text className='text-white font-vt323'>Categoria: {item.category}</Text>
                <Text className='text-white font-vt323'>Rank: {item.rank}</Text>
                <Text className='text-white font-vt323'>Dificuldade: {item.difficulty}</Text>
              </View>
            )}
          />
        )}
        {selectedSection === 'recompensa' && (
          <FlatList
            data={rewards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className='p-4 border-b border-neutral-700'>
                <Text className='text-white font-vt323'>Recompensa: {item.reward}</Text>
                <Text className='text-white font-vt323'>XP: {item.xp}</Text>
                <Text className='text-white font-vt323'>Ouro: {item.gold}</Text>
              </View>
            )}
          />
        )}
        {selectedSection === 'penalidade' && (
          <FlatList
            data={penalties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className='p-4 border-b border-neutral-700'>
                <Text className='text-white font-vt323'>Penalidade: {item.penalty}</Text>
                <Text className='text-white font-vt323'>Categoria: {item.category}</Text>
                <Text className='text-white font-vt323'>Dificuldade: {item.difficulty}</Text>
              </View>
            )}
          />
        )}
      </View>

      <ModalComponent 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onNavigate={handleNavigate}
      />

      <TouchableOpacity 
        className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5'
        onPress={handlePress}
      >
        <Text className='text-white text-center font-vt323'>Criar Nova Missão</Text>
      </TouchableOpacity>
    </View>
  );
}
