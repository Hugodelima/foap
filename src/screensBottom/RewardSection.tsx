import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';

import { PencilIcon, TrashIcon, ShoppingCartIcon } from 'react-native-heroicons/outline';

import filter from '../assets/images/mission/filter.png'

import axios from 'axios';
import { API_URL } from '@env';
import { getUserId } from './ProgressScreen';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';
import RewardModal from '../modal/RewardModal';
import ConfirmationModal from '../modal/ConfirmationModal';
import ModalFilter from '../hooks/modalFilterReward';

interface Reward {
    id: number;
    titulo: string;
    ouro: number;
    situacao: string;
}

export default function RewardSection(){

    const { userData, setUserData } = useFetchStatusUser();

    const [filterModalVisible, setFilterModalVisible] = useState(false); // Controla o modal

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [filterStatus, setFilterStatus] = useState<string | null>(''); // 'aberta' ou 'comprada'
    const filteredRewards = filterStatus
    ? rewards.filter((reward) => reward.situacao === filterStatus)
    : rewards;

    const [selectedReward, setSelectedReward] = useState<Reward | null>(null); // Armazena a recompensa selecionada
    const [isRewardModalVisible, setRewardModalVisible] = useState(false);

    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [modalVisible, setModalVisible] = useState(false);


    useEffect(() => {
        fetchRewards(); 

        const interval = setInterval(() => {
            fetchRewards(); 

        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const fetchRewards = async () => {
        try {
          const userId = await getUserId();
          const response = await axios.get(`${API_URL}/api/rewardapi/${userId}`);
          setRewards(response.data);
        } catch (error) {
          console.error('Erro ao buscar recompensas:', error);
        }
    };

    const handleFilterSelection = (status: string) => {
        console.log(filterStatus)
        setFilterStatus(status === 'todos' ? '' : status); // Define como vazio se for "todos"
        setFilterModalVisible(false); // Fecha o modal após a seleção
    };
    
    const handleOpenFilterModal = () => {
        setFilterModalVisible(true);
    };

    const openRewardModal = (reward = null) => {
        setSelectedReward(reward);
        setRewardModalVisible(true);
    };

    

    const confirmDelete = (action: () => void) => {
        setDeleteAction(() => action);
        setModalVisible(true);
    };

    const handleDeleteReward = (rewardId: number) => {
        confirmDelete(async () => {
          try {
            await axios.delete(`${API_URL}/api/rewardapi/delete/${rewardId}`);
            Alert.alert('Recompensa excluída com sucesso!');
            fetchRewards();
          } catch (error: any) {
            console.error('Erro ao excluir recompensa:', error);
            Alert.alert('Erro ao excluir recompensa', error.response?.data?.message || 'Erro ao tentar excluir.');
          }
        });
    };

    const handleBuyReward = async (rewardId: number, goldCost: number) => {
        try {
            const userId = await getUserId(); // Obtém o ID do usuário
            if (userData?.ouro >= goldCost) {
                await axios.post(`${API_URL}/api/rewardapi/buy/${rewardId}`, { 
                    id_usuario: userId
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

    const executeDelete = () => {
        if (deleteAction) {
          deleteAction();
          setModalVisible(false);
        }
    };

    
    return(
        <>
            <View className="flex items-end">
                <TouchableOpacity className='mt-4 mr-4 w-12 h-12 rounded-full' onPress={handleOpenFilterModal}>
                    <Image source={filter} style={{width: 50, height: 50}} />
                </TouchableOpacity>
            </View>


            <View className='flex-1'>
                <FlatList
                    className='mb-28'
                    data={filteredRewards}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className='p-4 border-b border-neutral-700'>
                            <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                            <Text className='text-white font-vt323'>Status: {item.situacao}</Text>
                            <Text className='text-white font-vt323'>Ouro: {item.ouro}</Text>

                            {/* Botões para Editar e Excluir */}
                            {item.situacao !== 'comprada' && (
                                <View className='flex-row justify-between mt-2 mb-2'>
                                
                                <View className='flex-row'>
                                    {/* Botão para Editar Recompensa */}
                                    <TouchableOpacity onPress={() => openRewardModal(item)} className="mr-4">
                                        <PencilIcon size={30} color="orange" />
                                    </TouchableOpacity>


                                    {/* Botão para Excluir Recompensa */}
                                    <TouchableOpacity onPress={() => handleDeleteReward(item.id)}>
                                        <TrashIcon size={30} color="red" />
                                    </TouchableOpacity>
                                </View>
                                    <View>
                                        {/* Botão para Comprar Recompensa, posicionado à direita */}
                                        <TouchableOpacity onPress={() => handleBuyReward(item.id, item.ouro)}>
                                            <ShoppingCartIcon size={30} color="green" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                />

                

                


                <TouchableOpacity onPress={() => openRewardModal()} className="bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5">
                <Text className="text-white text-center font-vt323">Criar Nova Recompensa</Text>
                </TouchableOpacity>
                
                <RewardModal
                    visible={isRewardModalVisible}
                    onClose={() => setRewardModalVisible(false)}
                    onSave={fetchRewards}
                    reward={selectedReward}
                />

                <ConfirmationModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onConfirm={executeDelete}
                    message="Tem certeza que deseja excluir este item?"
                />

                <ModalFilter
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)} // Fecha o modal
                    onFilter={handleFilterSelection} // Função chamada quando uma opção é selecionada
                />
            </View>        
        </>
    )
}