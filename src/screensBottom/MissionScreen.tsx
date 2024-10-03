import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { useFetchUserData } from '../hooks/useFetchDataUser';
import ModalComponent from '../modal/moreOptions';
import ModalReward from '../modal/addReward';
import ModalEditReward from '../modal/editReward'; // Modal para editar a recompensa
import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';
import moreOptions_image from '../assets/images/home/more_options.png';
import * as SecureStore from 'expo-secure-store';

interface Reward {
  id: number;
  titulo: string;
  gold: number;
  status: string;
}

async function getUserId() {
  const userID = await SecureStore.getItemAsync('userStorageID');
  return userID;
}

export default function MissionScreen() {
  
  const [modalVisibleOption, setModalVisibleOption] = useState(false);
  const [modalVisibleReward, setModalVisibleReward] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false); // Modal para editar
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null); // Armazena a recompensa selecionada
  const [selectedSection, setSelectedSection] = useState<string>('missao');
  const { userData, setUserData } = useFetchUserData();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const navigation = useNavigation();

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen);
  };
  
  const fetchRewards = async () => {
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/rewardapi/${userId}`);
      setRewards(response.data);
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
    }
  };

  useEffect(() => {
    fetchRewards();

    const interval = setInterval(() => {
      fetchRewards();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleBuyReward = async (rewardId: number, goldCost: number) => {
    try {
      if (userData?.ouro >= goldCost) {
        const response = await axios.post(`${API_URL}/rewards/buy/${rewardId}`);
        setUserData({ ...userData, ouro: userData?.ouro - goldCost });
        Alert.alert('Compra realizada com sucesso!');
        fetchRewards(); // Atualiza a lista de recompensas após a compra
      } else {
        Alert.alert('Saldo insuficiente de ouro!');
      }
    } catch (error) {
      console.error('Erro ao comprar recompensa:', error);
      Alert.alert('Erro ao comprar recompensa', error.response?.data?.message || 'Erro ao tentar comprar.');
    }
  };

  const handleCreateReward = () => {
    setModalVisibleReward(true);
  };

  const handleRewardCreated = () => {
    setModalVisibleReward(false);
    fetchRewards();
  };

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward); // Define a recompensa a ser editada
    setModalEditVisible(true); // Abre o modal de edição
  };

  const handleRewardEdited = () => {
    setModalEditVisible(false);
    fetchRewards(); // Atualiza as recompensas após a edição
  };

  const handleDeleteReward = async (rewardId: number) => {
    try {
      await axios.delete(`${API_URL}/rewards/delete/${rewardId}`);
      Alert.alert('Recompensa excluída com sucesso!');
      fetchRewards(); // Atualiza a lista de recompensas após a exclusão
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      Alert.alert('Erro ao excluir recompensa', error.response?.data?.message || 'Erro ao tentar excluir.');
    }
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
            <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'missao' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
              Missões
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedSection('recompensa')}>
            <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'recompensa' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
              Recompensas
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity className="absolute right-4 top-12" onPress={() => setModalVisibleOption(true)}>
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
                  <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                  <Text className='text-white font-vt323'>Status: {item.status}</Text>
                  <Text className='text-white font-vt323'>Ouro: {item.gold}</Text>

                  {/* Botão para Comprar Recompensa */}
                  <TouchableOpacity onPress={() => handleBuyReward(item.id, item.gold)}>
                    <Text className='text-green-400 font-vt323'>Comprar Recompensa</Text>
                  </TouchableOpacity>

                  {/* Botão para Editar Recompensa */}
                  <TouchableOpacity onPress={() => handleEditReward(item)}>
                    <Text className='text-orange-400 font-vt323'>Editar Recompensa</Text>
                  </TouchableOpacity>

                  {/* Botão para Excluir Recompensa */}
                  <TouchableOpacity onPress={() => handleDeleteReward(item.id)}>
                    <Text className='text-red-400 font-vt323'>Excluir Recompensa</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Modal de Criação de Recompensa */}
            <ModalReward
              visible={modalVisibleReward}
              onClose={() => setModalVisibleReward(false)}
              onSave={handleRewardCreated}
            />

            {/* Modal de Edição de Recompensa */}
            <ModalEditReward
              visible={modalEditVisible}
              reward={selectedReward} // Passa a recompensa selecionada
              onClose={() => setModalEditVisible(false)}
              onSave={handleRewardEdited}
            />

            <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreateReward}>
              <Text className='text-white text-center font-vt323'>Criar Nova Recompensa</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ModalComponent visible={modalVisibleOption} onClose={() => setModalVisibleOption(false)} onNavigate={handleNavigate} />
    </View>
  );
}
