import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, Animated } from 'react-native';

import filter from '../assets/images/mission/filter.png';
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
  id_missao?: number | null;
}

export default function PenaltySection() {
  const [filterModalVisiblePenalty, setFilterModalVisiblePenalty] = useState(false);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [filterPenaltyStatus, setFilterPenaltyStatus] = useState<string | null>(''); 
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const skeletonOpacity = useRef(new Animated.Value(0.3)).current;

  const animateSkeleton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const SkeletonBox = ({ height, width, radius = 8, style = {} }) => (
    <Animated.View
      style={{
        backgroundColor: '#444',
        opacity: skeletonOpacity,
        height,
        width,
        borderRadius: radius,
        marginBottom: 10,
        ...style,
      }}
    />
  );

  useEffect(() => {
    animateSkeleton();
  }, []);

  useEffect(() => {
    fetchPenalties(); 
    const interval = setInterval(() => {
      fetchPenalties(); 
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredPenalties = filterPenaltyStatus ? penalties.filter((penalty) => penalty.situacao === filterPenaltyStatus) : penalties;

  const handlePenaltyFilterSelection = (status: string) => {
    setFilterPenaltyStatus(status === 'todos' ? '' : status);
    setFilterModalVisiblePenalty(false); 
  };

  const handleOvercomePenalty = async (penaltyId: number) => {
    try {
      const response = await axios.put(`${API_URL}/api/penaltyapi/overcome/${penaltyId}`);
      if (response.status === 200) {
        Alert.alert('Sucesso', response.data.message);
        fetchPenalties();
      }
    } catch (error: any) {
      console.error('Erro ao superar penalidade:', error);
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao superar penalidade.');
    }
  };

  const fetchPenalties = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/penaltyapi/${userId}`);
      setPenalties(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar penalidades:', error);
      setLoading(false);
    } 
  };

  const handleOpenPenaltyFilterModal = () => {
    setFilterModalVisiblePenalty(true);
  };

  const handleEditPenalty = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setPenaltyModalVisible(true);
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

  return (
    <View className='flex-1 bg-neutral-900'>
      <View className="flex items-end">
        {loading ? (
          <SkeletonBox height={50} width={50} radius={25} style={{ marginTop: 16, marginRight: 16 }} />
        ) : (
          <TouchableOpacity 
            className='mt-4 mr-4 w-12 h-12 rounded-full'  
            onPress={handleOpenPenaltyFilterModal}>
            <Image source={filter} style={{width: 50, height: 50}} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        className="mb-28"
        data={loading ? Array(5).fill({}) : filteredPenalties}
        keyExtractor={(item, index) => loading ? `skeleton-${index}` : item.id.toString()}
        renderItem={({ item, index }) => (
          loading ? (
            <View className="p-4 border-b border-neutral-700">
              <SkeletonBox height={20} width={'80%'} />
              <SkeletonBox height={20} width={'70%'} />
              <SkeletonBox height={20} width={'60%'} />
              <SkeletonBox height={20} width={'50%'} />
              <SkeletonBox height={20} width={'90%'} style={{ marginBottom: 20 }} />
              
              <View className="flex-row justify-between mt-4">
                <View className="flex-row">
                  <SkeletonBox height={30} width={30} radius={15} style={{ marginRight: 16 }} />
                  <SkeletonBox height={30} width={30} radius={15} />
                </View>
                <SkeletonBox height={30} width={30} radius={15} />
              </View>
            </View>
          ) : (
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
                {item.situacao === 'Pendente' && item.id_missao == null && (
                  <>
                    <TouchableOpacity onPress={() => handleEditPenalty(item)} className="mr-4">
                      <PencilIcon size={30} color="orange" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => handleDeletePenalty(item.id)} className="mr-4">
                      <TrashIcon size={30} color="red" />
                    </TouchableOpacity>
                  </>
                )}

                {item.situacao === 'Em andamento' && (
                  <TouchableOpacity onPress={() => handleOvercomePenalty(item.id)}>
                    <CheckIcon size={30} color="green" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )
        )}
        ListEmptyComponent={
            !loading && filteredPenalties.length === 0 ? (
            <View className="p-4 items-center">
                <Text className="text-white">Nenhuma penalidade encontrada</Text>
            </View>
            ) : null
        }
      />

      {loading ? (
        <SkeletonBox
          height={50}
          width={'90%'}
          radius={25}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
          }}
        />
      ) : (
        <TouchableOpacity 
          className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' 
          onPress={handleCreatePenalty}>
          <Text className='text-white text-center font-vt323'>Criar Nova Penalidade</Text>
        </TouchableOpacity>
      )}

      <PenaltyModal
        visible={penaltyModalVisible}
        onClose={() => setPenaltyModalVisible(false)}
        onSave={fetchPenalties}
        penalty={selectedPenalty}
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
  );
}