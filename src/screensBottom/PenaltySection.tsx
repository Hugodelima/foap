import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';

import filter from '../assets/images/mission/filter.png'

import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';

import { PencilIcon, TrashIcon, ShoppingCartIcon, CheckIcon } from 'react-native-heroicons/outline';

import axios from 'axios';
import { API_URL } from '@env';
import { getUserId } from './ProgressScreen';
import PenaltyModal from '../modal/PenaltyModal';
import ModalFilterPenalty from '../hooks/modalFilterPenalty';
import ConfirmationModal from '../modal/ConfirmationModal';

interface Penalty {
    id: number;
    titulo: string;
    situacao: string;
    dificuldade: string;
    rank: string;
    perdaOuro: number;
    perdaXp: number;
}

export default function PenaltySection(){
    const [filterModalVisiblePenalty, setFilterModalVisiblePenalty] = useState(false);

    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [filterPenaltyStatus, setFilterPenaltyStatus] = useState<string | null>(''); 
    const filteredPenalties = filterPenaltyStatus ? penalties.filter((penalty) => penalty.situacao === filterPenaltyStatus) : penalties;

    const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);

    const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);

    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePenaltyFilterSelection = (status: string) => {
        setFilterPenaltyStatus(status === 'todos' ? '' : status);
        setFilterModalVisiblePenalty(false); 
    };

    useEffect(() => {
        fetchPenalties(); 

        const interval = setInterval(() => {
            fetchPenalties(); 

        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleOvercomePenalty = async (penaltyId: number) => {
        try {
          const response = await axios.put(`${API_URL}/api/penaltyapi/overcome/${penaltyId}`);
          if (response.status === 200) {
            Alert.alert('Sucesso', response.data.message);
            fetchPenalties()
          }
        } catch (error: any) {
          console.error('Erro ao superar penalidade:', error);
          Alert.alert('Erro', error.response?.data?.error || 'Erro ao superar penalidade.');
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

    const handleOpenPenaltyFilterModal = () => {
        setFilterModalVisiblePenalty(true);
    };

    const handleEditPenalty = (penalty: Penalty) => {
        setSelectedPenalty(penalty)
        setPenaltyModalVisible(true)
    };

    const confirmDelete = (action: () => void) => {
        setDeleteAction(() => action);
        setModalVisible(true);
    };

    const handleDeletePenalty = (penaltyId: number) => {
        confirmDelete(async () => {
          try {
            await axios.delete(`${API_URL}/api/penaltyapi/delete/${penaltyId}`);
            Alert.alert('Penalidade excluída com sucesso!');
            fetchPenalties();
          } catch (error: any) {
            console.error('Erro ao excluir penalidade:', error);
            Alert.alert('Erro ao excluir penalidade', error.response?.data?.message || 'Erro ao tentar excluir.');
          }
        });
    };

    const handleCreatePenalty = () => {
        setSelectedPenalty(null);
        setPenaltyModalVisible(true);
    };

    const executeDelete = () => {
        if (deleteAction) {
          deleteAction();
          setModalVisible(false);
        }
    };

    return(
        <View className='flex-1'>
            <View className="flex items-end">
            <TouchableOpacity 
                className='mt-4 mr-4 w-12 h-12 rounded-full'  
                onPress={handleOpenPenaltyFilterModal}>
                <Image source={filter} style={{width: 50, height: 50}} />
            </TouchableOpacity>
            </View>
            <FlatList
            className="mb-28"
            data={filteredPenalties}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View className="p-4 border-b border-neutral-700">
                <Text className="text-white font-vt323">Título: {item.titulo}</Text>
                <Text className="text-white font-vt323">Status: {item.situacao}</Text>
                <Text className="text-white font-vt323">Dificuldade: {item.dificuldade}</Text>
                <Text className="text-white font-vt323">Rank: {item.rank}</Text>
                <Text className="text-white font-vt323 mb-4">
                    Penalidades: {item.perdaOuro}
                    <Image source={gold_image} style={{ width: 30, height: 30 }} /> {item.perdaXp}
                    <Image source={xp_image} style={{ width: 30, height: 30 }} />
                </Text>

                <View className="flex-row justify-between mt-2 mb-2">
                    {/* Botões somente se o status for "Pendente" */}
                    {item.situacao === 'Pendente' && item.id_missao == null && (
                    <>
                        {/* Botão para Editar Penalidade */}
                        <TouchableOpacity onPress={() => handleEditPenalty(item)} className="mr-4">
                            <PencilIcon size={30} color="orange" />
                        </TouchableOpacity>
                        

                        {/* Botão para Excluir Penalidade */}
                        <TouchableOpacity onPress={() => handleDeletePenalty(item.id)} className="mr-4">
                            <TrashIcon size={30} color="red" />
                        </TouchableOpacity>
                    </>
                    )}

                    {/* Botão para Superar Penalidade se o status for 'Em andamento' */}
                    {item.situacao === 'Em andamento' && (
                    <TouchableOpacity onPress={() => handleOvercomePenalty(item.id)}>
                        <CheckIcon size={30} color="green" />
                    </TouchableOpacity>
                    )}
                </View>
                </View>
            )}
            />

            

            
            
            <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreatePenalty}>
                <Text className='text-white text-center font-vt323'>Criar Nova Penalidade</Text>
            </TouchableOpacity>

            <PenaltyModal
                visible={penaltyModalVisible}
                onClose={() => setPenaltyModalVisible(false)}
                onSave={fetchPenalties} // Atualizar lista após salvar
                penalty={selectedPenalty} // Se for edição, passa o item, senão é undefined
            />

            <ModalFilterPenalty
                visible={filterModalVisiblePenalty}
                onClose={() => setFilterModalVisiblePenalty(false)}
                onFilter={handlePenaltyFilterSelection}
            />

            <ConfirmationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={executeDelete}
                message="Tem certeza que deseja excluir este item?"
            />
        </View>
    )
}