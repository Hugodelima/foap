import React, { useState, useEffect } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';

interface PenaltyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  penalty?: { id: number; titulo: string; dificuldade: string; rank: string; situacao: string };
}

export default function PenaltyModal({ visible, onClose, onSave, penalty }: PenaltyModalProps) {
  const isEditing = !!penalty;
  
  const { userData } = useFetchStatusUser();

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [rank, setRank] = useState('F');
  const [status, setStatus] = useState('Pendente');

  const availableRanks = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'];
  const userRankIndex = availableRanks.indexOf(userData?.rank);
  const userRanks = userRankIndex !== -1 ? availableRanks.slice(0, userRankIndex + 1) : ['F'];

  useEffect(() => {
    if (penalty) {
      setTitle(penalty.titulo);
      setDifficulty(penalty.dificuldade);
      setRank(penalty.rank);
      setStatus(penalty.situacao);
    } else {
      setTitle('');
      setDifficulty('Fácil');
      setRank('F');
      setStatus('Pendente');
    }
  }, [penalty]);

  const handleSavePenalty = async () => {
    if (!title || !difficulty || !rank) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const userID = await SecureStore.getItemAsync('userStorageID');

      if (!userID) {
        Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        return;
      }

      const penaltyData = {
        titulo: title,
        dificuldade: difficulty,
        rank,
        situacao: status,
        id_usuario: JSON.parse(userID),
      };

      if (isEditing) {
        await axios.put(`${API_URL}/api/penaltyapi/update/${penalty?.id}`, penaltyData);
        Alert.alert('Penalidade editada', 'A penalidade foi editada com sucesso.');
      } else {
        await axios.post(`${API_URL}/api/penaltyapi/create`, penaltyData);
        Alert.alert('Penalidade aplicada', 'A penalidade foi criada com sucesso.');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar penalidade:', error);
      Alert.alert('Erro ao salvar penalidade', error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">
            {isEditing ? 'Editar Penalidade' : 'Adicionar Nova Penalidade'}
          </Text>

          <Text className="text-white mb-1 text-xl">Título</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título"
          />

          <Text className="text-white mb-1 text-xl">Dificuldade</Text>
          <View className="bg-gray-100 rounded-2xl mb-3">
            <Picker selectedValue={difficulty} onValueChange={(itemValue) => setDifficulty(itemValue)}>
              <Picker.Item label="Fácil" value="Fácil" />
              <Picker.Item label="Médio" value="Médio" />
              <Picker.Item label="Difícil" value="Difícil" />
              <Picker.Item label="Absurdo" value="Absurdo" />
            </Picker>
          </View>

          <Text className="text-white mb-1 text-xl">Rank</Text>
          <View className="bg-gray-100 rounded-2xl mb-3">
            <Picker selectedValue={rank} onValueChange={(itemValue) => setRank(itemValue)}>
              {userRanks.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity onPress={handleSavePenalty} className="py-3 bg-blue-400 rounded-xl">
            <Text className="font-bold text-center text-gray-700">{isEditing ? 'Salvar' : 'Criar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
