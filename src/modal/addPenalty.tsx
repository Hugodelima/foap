import React, { useState } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker'; // Importando o Picker para o select

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ModalPenalty({ visible, onClose, onSave }: ModalComponentProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [rank, setRank] = useState('F');

  
  const handleAddPenalty = async () => {
    if (title && difficulty && rank) {
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');
      
        if (userID) {
          const response = await axios.post(`${API_URL}/api/penaltyapi/create`, {
            titulo: title,
            dificuldade: difficulty,
            rank,
            situacao: 'Pendente',
            id_usuario: JSON.parse(userID),
          });

          const { message } = response.data;

          Alert.alert('Penalidade aplicada', message);

          onSave();
          onClose();
        } else {
          Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        }
      } catch (error) {
        console.error('Erro ao criar penalidade:', error);
        Alert.alert('Erro ao criar penalidade', error.response?.data?.message || 'Erro desconhecido.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };


  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">Adicionar Nova Penalidade</Text>

          <Text className="text-white mb-1 text-xl">Título</Text>
          <TextInput
            className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
            value={title}
            onChangeText={setTitle}
            placeholder="Digite o título"
            keyboardType='default'
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
              <Picker.Item label="F" value="F" />
              <Picker.Item label="E" value="E" />
              <Picker.Item label="D" value="D" />
              <Picker.Item label="C" value="C" />
              <Picker.Item label="B" value="B" />
              <Picker.Item label="A" value="A" />
              <Picker.Item label="S" value="S" />
              <Picker.Item label="SS" value="SS" />
              <Picker.Item label="SSS" value="SSS" />
              <Picker.Item label="SSS+" value="SSS+" />
            </Picker>
          </View>

          <TouchableOpacity onPress={handleAddPenalty} className='py-3 bg-blue-400 rounded-xl'>
            <Text className='font-bold text-center text-gray-700'>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
