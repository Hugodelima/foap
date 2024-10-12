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
import filter from '../assets/images/mission/filter.png'
import ModalFilter from '../hooks/modalFilterReward';
import { PencilIcon, TrashIcon, ShoppingCartIcon } from 'react-native-heroicons/outline';
import ModalPenalty from '../modal/addPenalty'
import { NavigationProps } from '../navigation/types';
import ModalFilterPenalty from '../hooks/modalFilterPenalty';

interface Reward {
  id: number;
  titulo: string;
  gold: number;
  status: string;
}

interface Penalty {
  id: number;
  titulo: string;
  status: string;
  dificuldade: string;
  rank: string;
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
  const navigation = useNavigation<NavigationProps>();
  const [filterModalVisible, setFilterModalVisible] = useState(false); // Controla o modal
  const [filterStatus, setFilterStatus] = useState<string | null>('em aberto'); // 'aberta' ou 'comprada'
  const filteredRewards = filterStatus
  ? rewards.filter((reward) => reward.status === filterStatus)
  : rewards;

  //penalidades
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [modalVisiblePenalty, setModalVisiblePenalty] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [filterModalVisiblePenalty, setFilterModalVisiblePenalty] = useState(false);
  const [filterStatusPenalty, setFilterStatusPenalty] = useState<string>('em aberto'); // 'aberta' ou 'concluída'

  const handleOpenPenaltyFilterModal = () => {
    setFilterModalVisiblePenalty(true);
  };

  const handleFilterSelection = (status: string) => {
    setFilterStatus(status); // Atualiza o status do filtro
    setFilterModalVisible(false); // Fecha o modal após a seleção
  };

  const handleOpenFilterModal = () => {
    setFilterModalVisible(true);
  };
  
  const handleNavigate = (screen: any) => {
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
  const fetchPenalties = async () => {
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/penaltyapi/${userId}`); // Substitua com sua rota
      setPenalties(response.data);
    } catch (error) {
      console.error('Erro ao buscar penalidades:', error);
    }
  };
  

  useEffect(() => {
    fetchRewards();
    fetchPenalties();
    const interval = setInterval(() => {
      fetchRewards();
      fetchPenalties();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

 
  const handleBuyReward = async (rewardId: number, goldCost: number) => {
    try {
        const userId = await getUserId(); // Obtém o ID do usuário
        if (userData?.ouro >= goldCost) {
            const response = await axios.post(`${API_URL}/api/rewardapi/buy/${rewardId}`, { 
                userId, // Passa o ID do usuário
                goldCost // Passa o custo da recompensa
            });
            
            setUserData({ ...userData, ouro: userData?.ouro - goldCost });
            Alert.alert('Compra realizada com sucesso!');
            fetchRewards();
        } else {
            Alert.alert('Saldo insuficiente de ouro!');
        }
    } catch (error: any) {
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
  const handleCreatePenalty = () => {
    setModalVisiblePenalty(true);
  };
  
  const handlePenaltyCreated = () => {
    setModalVisiblePenalty(false);
    fetchPenalties(); // Atualiza as penalidades após a criação
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
      await axios.delete(`${API_URL}/api/rewardapi/delete/${rewardId}`);
      Alert.alert('Recompensa excluída com sucesso!');
      fetchRewards(); // Atualiza a lista de recompensas após a exclusão
    } catch (error: any) {
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
          <TouchableOpacity onPress={() => setSelectedSection('penalidade')}>
            <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'penalidade' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
              Penalidades
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
        {selectedSection === 'missao' && (
          <>
          </>
        )}
        {selectedSection === 'penalidade' && (
          <>
            <View className='flex-1'>
              <View className="flex items-end">
                <TouchableOpacity 
                  className='mt-4 mr-4 w-12 h-12 rounded-full'  
                  onPress={handleOpenPenaltyFilterModal}>
                  <Image source={filter} style={{width: 50, height: 50}} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={penalties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className='p-4 border-b border-neutral-700'>
                    <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                    <Text className='text-white font-vt323'>Status: {item.status}</Text>
                    <Text className='text-white font-vt323'>Dificuldade: {item.dificuldade}</Text>
                    <Text className='text-white font-vt323'>Rank: {item.rank}</Text>

                    <View className='flex-row justify-between mt-2 mb-2'>
                      {/* Botão para Editar Penalidade */}
                      <TouchableOpacity onPress={() => handleEditPenalty(item)} className='mr-4'>
                        <PencilIcon size={30} color="orange" />
                      </TouchableOpacity>

                      {/* Botão para Excluir Penalidade */}
                      <TouchableOpacity onPress={() => handleDeletePenalty(item.id)}>
                        <TrashIcon size={30} color="red" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreatePenalty}>
                <Text className='text-white text-center font-vt323'>Criar Nova Penalidade</Text>
              </TouchableOpacity>
            </View>
            
          </>
        )}

        
        {selectedSection === 'recompensa' && (
          <>
            <View className="flex items-end">
              <TouchableOpacity 
                className='mt-4 mr-4 w-12 h-12 rounded-full'  
                onPress={handleOpenFilterModal}>
                <Image source={filter} style={{width: 50, height: 50}} />
              </TouchableOpacity>
            </View>


            <View className='flex-1'>
              <FlatList
                data={filteredRewards}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className='p-4 border-b border-neutral-700'>
                    <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                    <Text className='text-white font-vt323'>Status: {item.status}</Text>
                    <Text className='text-white font-vt323'>Ouro: {item.gold}</Text>

                    {/* Botões para Editar e Excluir */}
                    {item.status !== 'comprada' && (
                      <View className='flex-row justify-between mt-2 mb-2'>
                        
                        <View className='flex-row'>
                          {/* Botão para Editar Recompensa */}
                          <TouchableOpacity onPress={() => handleEditReward(item)} className='mr-4'>
                            <PencilIcon size={30} color="orange" />
                          </TouchableOpacity>

                          {/* Botão para Excluir Recompensa */}
                          <TouchableOpacity onPress={() => handleDeleteReward(item.id)}>
                            <TrashIcon size={30} color="red" />
                          </TouchableOpacity>
                        </View>
                        <View>
                          {/* Botão para Comprar Recompensa, posicionado à direita */}
                          <TouchableOpacity onPress={() => handleBuyReward(item.id, item.gold)}>
                            <ShoppingCartIcon size={30} color="green" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    
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
                reward={selectedReward || { id: 0, titulo: '', gold: 0, status: '' }} // Passa a recompensa selecionada
                onClose={() => setModalEditVisible(false)}
                onSave={handleRewardEdited}
              />

              <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreateReward}>
                <Text className='text-white text-center font-vt323'>Criar Nova Recompensa</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ModalComponent visible={modalVisibleOption} onClose={() => setModalVisibleOption(false)} onNavigate={handleNavigate} />

      <ModalFilter
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)} // Fecha o modal
        onFilter={handleFilterSelection} // Função chamada quando uma opção é selecionada
      />
      <ModalFilterPenalty
        visible={filterModalVisiblePenalty}
        onClose={() => setFilterModalVisiblePenalty(false)}
        onFilter={handleFilterSelection}
      />

      <ModalPenalty
        visible={modalVisiblePenalty}
        onClose={() => setModalVisiblePenalty(false)}
        onSave={handlePenaltyCreated} // Função que deve ser implementada para criar a penalidade
      />

    </View>
  );
}
