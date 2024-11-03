import React, { useState } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ModalMission({ visible, onClose, onSave }: ModalComponentProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [rank, setRank] = useState('F');
  const [xpReward, setXpReward] = useState('');
  const [goldReward, setGoldReward] = useState('');
  const [pdReward, setPdReward] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreateMission = async () => {
    if (title && difficulty && rank && xpReward && goldReward && pdReward && deadline) {
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');
      
        if (userID) {
          const response = await axios.post(`${API_URL}/api/missionapi/create`, {
            titulo: title,
            rank,
            prazo: deadline,
            dificuldade: difficulty,
            recompensa: {
              xp: parseInt(xpReward),
              ouro: parseInt(goldReward),
              pd: parseInt(pdReward),
            },
            status: 'Em progresso', 
            userId: JSON.parse(userID),
          });

          const { message } = response.data;

          Alert.alert('Missão Criada', message);

          onSave();
          onClose();
        } else {
          Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        }
      } catch (error) {
        console.error('Erro ao criar missão:', error);
        Alert.alert('Erro ao criar missão', error.response?.data?.message || 'Erro desconhecido.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60 p-10">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <ScrollView>
            <Text className="text-white text-2xl font-semibold mb-6">Adicionar Nova Missão</Text>

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

            <Text className="text-white mb-1 text-xl">Recompensa (XP)</Text>
            <TextInput
              className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
              value={xpReward}
              onChangeText={setXpReward}
              placeholder="XP"
              keyboardType='numeric'
            />

            <Text className="text-white mb-1 text-xl">Recompensa (Ouro)</Text>
            <TextInput
              className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
              value={goldReward}
              onChangeText={setGoldReward}
              placeholder="Ouro"
              keyboardType='numeric'
            />

            <Text className="text-white mb-1 text-xl">Recompensa (PD)</Text>
            <TextInput
              className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
              value={pdReward}
              onChangeText={setPdReward}
              placeholder="PD"
              keyboardType='numeric'
            />

            <Text className="text-white mb-1 text-xl">Prazo</Text>
            <TextInput
              className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
              value={deadline}
              onChangeText={setDeadline}
              placeholder="Prazo (AAAA-MM-DD)"
              keyboardType='default'
            />

            <TouchableOpacity onPress={handleCreateMission} className='py-3 bg-yellow-400 rounded-xl'>
              <Text className='font-bold text-center text-gray-700'>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
