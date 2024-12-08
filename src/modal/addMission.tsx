import React, { useState, useEffect } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';

interface Penalty {
  id: string;
  titulo: string;
  missionId: string | null;
}

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ModalMission({ visible, onClose, onSave }: ModalComponentProps) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [rank, setRank] = useState('F');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [selectedPenalties, setSelectedPenalties] = useState<string[]>([]);
  const [repetition, setRepetition] = useState('Não'); 

  useEffect(() => {
    if (visible) {
      const fetchPenalties = async () => {
        try {
          const userID = await SecureStore.getItemAsync('userStorageID');
          const response = await axios.get(`${API_URL}/api/penaltyapi/all/${userID}`);
          
          const availablePenalties = response.data.penalties.filter((penalty: Penalty) => !penalty.missionId);
          setPenalties(availablePenalties);
        } catch (error) {
          console.error('Erro ao buscar penalidades:', error);
          Alert.alert('Erro', 'Não foi possível carregar as penalidades.');
        }
      };
      fetchPenalties();
    }
  }, [visible]);

  const togglePenaltySelection = (penaltyId: string) => {
    setSelectedPenalties((prevSelected) =>
      prevSelected.includes(penaltyId)
        ? prevSelected.filter((id) => id !== penaltyId)
        : [...prevSelected, penaltyId]
    );
  };

  const handleCreateMission = async () => {
    if (title && difficulty && rank && selectedPenalties.length > 0) {
      // Verificar se o prazo é anterior a hoje
      if (repetition !== 'Diariamente' && moment(deadline).isBefore(moment(), 'day')) {
        Alert.alert(
          'Erro',
          'O prazo da missão não pode ser anterior a hoje. Por favor, escolha uma data válida.'
        );
        return;
      }
  
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');
        if (userID) {
          const formattedDeadline = repetition === 'Diariamente'
            ? moment().endOf('day').format() // Enviar o fim do dia atual como prazo
            : moment(deadline).format('YYYY-MM-DD');
  
          const response = await axios.post(`${API_URL}/api/missionapi/create`, {
            titulo: title,
            rank,
            prazo: formattedDeadline, // Envia sempre um valor válido
            dificuldade: difficulty,
            penalidadeIds: selectedPenalties,
            repeticao: repetition === 'Diariamente' ? true : false,
            userId: JSON.parse(userID),
          });
  
          Alert.alert('Missão Criada', response.data.message);
  
          setTitle('');
          setDifficulty('Fácil');
          setRank('F');
          setDeadline(new Date());
          setSelectedPenalties([]);
          setRepetition('Não');
  
          onSave();
          onClose();
        } else {
          Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
        }
      } catch (error) {
        console.error('Erro ao criar missão:', error);
        Alert.alert('Erro ao criar missão', error.response.data.error || 'Erro desconhecido.');
      }
    } else {
      Alert.alert(
        'Erro',
        selectedPenalties.length === 0
          ? 'Nenhuma penalidade selecionada. Por favor, selecione pelo menos uma penalidade.'
          : 'Por favor, preencha todos os campos.'
      );
    }
  };
  
  
  
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60 p-10">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View>
                  <Text className="text-white text-2xl font-semibold mb-6">Adicionar Nova Missão</Text>
                  
                  {/* Input Título */}
                  <Text className="text-white mb-1 text-xl">Título</Text>
                  <TextInput
                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Digite o título"
                  />

                  {/* Campo Dificuldade */}
                  <Text className="text-white mb-1 text-xl">Dificuldade</Text>
                  <View className="bg-gray-100 rounded-2xl mb-3">
                    <Picker selectedValue={difficulty} onValueChange={(itemValue) => setDifficulty(itemValue)}>
                      <Picker.Item label="Fácil" value="Fácil" />
                      <Picker.Item label="Médio" value="Médio" />
                      <Picker.Item label="Difícil" value="Difícil" />
                      <Picker.Item label="Absurdo" value="Absurdo" />
                    </Picker>
                  </View>

                  {/* Campo Rank */}
                  <Text className="text-white mb-1 text-xl">Rank</Text>
                  <View className="bg-gray-100 rounded-2xl mb-3">
                    <Picker selectedValue={rank} onValueChange={(itemValue) => setRank(itemValue)}>
                      <Picker.Item label="F" value="F" />
                      <Picker.Item label="E" value="E" />
                      <Picker.Item label="D" value="D" />
                      <Picker.Item label="C" value="C" />
                    </Picker>
                  </View>

                  {/* Campo Repetição */}
                  <Text className="text-white mb-1 text-xl">Repetição</Text>
                  <View className="bg-gray-100 rounded-2xl mb-3">
                    <Picker selectedValue={repetition} onValueChange={(itemValue) => setRepetition(itemValue)}>
                      <Picker.Item label="Não" value="Não" />
                      <Picker.Item label="Diariamente" value="Diariamente" />
                    </Picker>
                  </View>
                  {/* Campo prazo visível apenas quando repetição != Diariamente */}
                  {repetition !== 'Diariamente' && (
                    <>
                      <Text className="text-white mb-1 text-xl">Prazo</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput
                          className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                          value={moment(deadline).format('YYYY-MM-DD')}
                          editable={false}
                        />
                      </TouchableOpacity>

                      {/* Componente DateTimePicker */}
                      {showDatePicker && (
                        <DateTimePicker
                          value={deadline}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setDeadline(selectedDate); // Atualiza a data selecionada
                            }
                          }}
                          minimumDate={moment().add(1, 'day').toDate()} // Data mínima é amanhã
                        />

                      
                      )}
                    </>
                  )}


                  {/* Campo Penalidades */}
                  <Text className="text-white mb-1 text-xl">Penalidades</Text>
                  <FlatList
                    data={penalties}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => togglePenaltySelection(item.id)} className="flex-row items-center p-2">
                        <Text className="text-white">{item.titulo}</Text>
                        <Text className="ml-auto text-white">
                          {selectedPenalties.includes(item.id) ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text className="text-gray-400">Nenhuma penalidade disponível</Text>} 
                  />

                  <TouchableOpacity onPress={handleCreateMission} className="py-3 bg-yellow-400 rounded-xl mt-4">
                    <Text className="font-bold text-center text-gray-700">Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
