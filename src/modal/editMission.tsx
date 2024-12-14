import React, { useState, useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

interface ModalEditMissionProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  mission?: {
    id: number;
    titulo: string;
    prazo: string;
    dificuldade: string;
    recompensaXp: number;
    recompensaOuro: number;
    recompensaPd: number;
  } | null;
}

export default function ModalEditMission({ visible, onClose, onSave, mission }: ModalEditMissionProps) {
  const [titulo, setTitulo] = useState('');
  const [prazo, setPrazo] = useState('');
  const [recompensaXp, setRecompensaXp] = useState('');
  const [recompensaOuro, setRecompensaOuro] = useState('');
  const [recompensaPd, setRecompensaPd] = useState('');

  useEffect(() => {
    if (mission) {
      setTitulo(mission.titulo);
      setPrazo(mission.prazo);
      setRecompensaXp(mission.recompensaXp.toString());
      setRecompensaOuro(mission.recompensaOuro.toString());
      setRecompensaPd(mission.recompensaPd.toString());
    } else {
      setTitulo('');
      setPrazo('');
      setRecompensaXp('');
      setRecompensaOuro('');
      setRecompensaPd('');
    }
  }, [mission]);

  const handleEditMission = async () => {
    if (titulo && prazo && recompensaXp && recompensaOuro && recompensaPd) {
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');

        if (userID && mission) {
          await axios.put(`${API_URL}/api/missionapi/update/${mission.id}`, {
            titulo,
            prazo,
            recompensaXp: Number(recompensaXp),
            recompensaOuro: Number(recompensaOuro),
            recompensaPd: Number(recompensaPd),
            userId: JSON.parse(userID),
          });

          onSave();
          onClose();
        } else {
          Alert.alert('Erro', 'Usuário ou missão não encontrado. Por favor, tente novamente.');
        }
      } catch (error: any) {
        console.error('Erro ao editar missão:', error);
        Alert.alert('Erro ao editar missão', error.response?.data?.message || 'Erro desconhecido.');
      }
    } else {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">Editar Missão</Text>

          {/* Campo Título */}
          <Text className="text-white mb-1 text-xl">Título</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Digite o título"
          />

          {/* Campo Prazo */}
          <Text className="text-white mb-1 text-xl">Prazo</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={prazo}
            onChangeText={setPrazo}
            placeholder="Digite o prazo no formato yyyy-mm-ddTHH:MM"
          />

          {/* Exibição apenas da dificuldade */}
          <Text className="text-white mb-1 text-xl">Dificuldade</Text>
          <Text className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3">
            {mission?.dificuldade || 'Não especificada'}
          </Text>

          {/* Campo Recompensa XP */}
          <Text className="text-white mb-1 text-xl">Recompensa XP</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={recompensaXp}
            onChangeText={setRecompensaXp}
            placeholder="Digite o valor de XP"
            keyboardType="numeric"
          />

          {/* Campo Recompensa Ouro */}
          <Text className="text-white mb-1 text-xl">Recompensa Ouro</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={recompensaOuro}
            onChangeText={setRecompensaOuro}
            placeholder="Digite o valor de ouro"
            keyboardType="numeric"
          />

          {/* Campo Recompensa PD */}
          <Text className="text-white mb-1 text-xl">Recompensa PD</Text>
          <TextInput
            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            value={recompensaPd}
            onChangeText={setRecompensaPd}
            placeholder="Digite o valor de PD"
            keyboardType="numeric"
          />

          {/* Botão Salvar */}
          <TouchableOpacity onPress={handleEditMission} className="py-3 bg-yellow-400 rounded-xl">
            <Text className="font-bold text-center text-gray-700">Salvar</Text>
          </TouchableOpacity>

          {/* Botão Fechar */}
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
