import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

interface RewardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  reward?: { id: number; titulo: string; ouro: number }; // Opcional para diferenciar criar/editar
}

export default function RewardModal({ visible, onClose, onSave, reward }: RewardModalProps) {
  const [title, setTitle] = useState('');
  const [gold, setGold] = useState('');

  useEffect(() => {
    if (reward) {
      setTitle(reward.titulo);
      setGold(reward.ouro?.toString() || '');
    } else {
      setTitle('');
      setGold('');
    }
  }, [reward]);

  const handleSave = async () => {
    if (!title || !gold) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const userID = await SecureStore.getItemAsync('userStorageID');

      if (!userID) {
        Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        return;
      }

      const payload = {
        titulo: title,
        ouro: Number(gold),
        id_usuario: JSON.parse(userID),
      };

      if (reward) {
        // Editar recompensa existente
        await axios.put(`${API_URL}/api/rewardapi/update/${reward.id}`, payload);
      } else {
        // Criar nova recompensa
        await axios.post(`${API_URL}/api/rewardapi/create`, payload);
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar recompensa:', error);
      Alert.alert('Erro ao salvar recompensa', error.response?.data?.message || 'Erro desconhecido.');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">
            {reward ? 'Editar Recompensa' : 'Adicionar Nova Recompensa'}
          </Text>

          <Text className="text-white mb-1 text-xl">Título</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título"
          />

          <Text className="text-white mb-1 text-xl">Valor do Ouro</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={gold}
            onChangeText={setGold}
            placeholder="Digite o valor do ouro"
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={handleSave} className={`py-3 rounded-xl ${reward ? 'bg-blue-400' : 'bg-blue-400'}`}>
            <Text className="font-bold text-center text-gray-700">{reward ? 'Salvar Alterações' : 'Adicionar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
