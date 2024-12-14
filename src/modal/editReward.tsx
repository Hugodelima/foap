import React, { useState, useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  reward: { id: number; titulo: string; gold: number; status: string };
}

export default function ModalEditReward({ visible, onClose, onSave, reward }: ModalComponentProps) {
  const [title, setTitle] = useState('');
  const [gold, setGold] = useState('');

  useEffect(() => {
    if (reward) {
      setTitle(reward.titulo);
      setGold(reward.gold.toString());
    }
  }, [reward]);

  const handleEditReward = async () => {
    if (title && gold) {
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');

        if (userID) {
          await axios.put(`${API_URL}/api/rewardapi/update/${reward.id}`, {
            title,
            gold: Number(gold),
            userId: JSON.parse(userID),  // Certifique-se de que o userID é um número
          });

          onSave();
          onClose();
        } else {
          Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        }
      } catch (error : any) {
        console.error('Erro ao editar recompensa:', error);
        Alert.alert('Erro ao editar recompensa', error.response?.data?.message || 'Erro desconhecido.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">Editar Recompensa</Text>

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

          <TouchableOpacity onPress={handleEditReward} className="py-3 bg-yellow-400 rounded-xl">
            <Text className="font-bold text-center text-gray-700">Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
