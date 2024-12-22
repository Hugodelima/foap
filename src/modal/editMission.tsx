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
    mission: any;
    onClose: () => void;
    onSave: () => void;
  }

  export default function ModalEditMission({ visible, mission, onClose, onSave }: ModalComponentProps) {
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState('Fácil');
    const [rank, setRank] = useState('F');
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [selectedPenalties, setSelectedPenalties] = useState<string[]>([]);
    const [repetition, setRepetition] = useState('Não'); 

    useEffect(() => {
      if (visible && mission) {
        const fetchPenalties = async () => {
          try {
            const userID = await SecureStore.getItemAsync('userStorageID');
            const response = await axios.get(`${API_URL}/api/penaltyapi/all/${userID}`);
            
            const availablePenalties = response.data.penalties.filter((penalty: Penalty) => !penalty.missionId || penalty.missionId === mission.id);
            setPenalties(availablePenalties);
    
            const linkedPenalties = response.data.penalties.filter((penalty: Penalty) => penalty.missionId === mission.id);
            setSelectedPenalties(linkedPenalties.map((penalty: Penalty) => penalty.id));
    
            // Preencher os campos com os dados da missão
            setTitle(mission.titulo);
            setDifficulty(mission.dificuldade);
            setRank(mission.rank);
            setRepetition(mission.repeticao);
            console.log('prazo da missão: '+mission.prazo)
    
            // Ajustar a data do prazo para ser a partir de amanhã, caso a repetição seja "Nunca"
            if (mission.repeticao === 'Nunca') {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1); // Configura para o dia seguinte
              tomorrow.setHours(23, 59, 59, 999); // Define o horário para o final do dia
              setDeadline(tomorrow);
            } else {
              setDeadline(mission.prazo ? new Date(mission.prazo) : new Date());
            }
    
          } catch (error) {
            console.error('Erro ao buscar penalidades:', error);
            Alert.alert('Erro', 'Não foi possível carregar as penalidades.');
          }
        };
    
        fetchPenalties();
      }
    }, [visible, mission]);
    
    
    
    
    
    

    const togglePenaltySelection = (penaltyId: string) => {
      if (selectedPenalties.includes(penaltyId)) {
        setSelectedPenalties(selectedPenalties.filter(id => id !== penaltyId));
      } else {
        setSelectedPenalties([...selectedPenalties, penaltyId]);
      }
    };

    const handleEditMission = async () => {
      if (title && difficulty && rank && selectedPenalties.length > 0) {
        try {
          const userID = await SecureStore.getItemAsync('userStorageID');
          if (userID) {
            const formattedDeadline = moment(deadline).format('YYYY-MM-DD');
            
            // Debugging - Verificar dados que estão sendo enviados
            console.log("Editando missão com os seguintes dados:", {
              titulo: title,
              rank,
              dificuldade: difficulty,
              repeticao: repetition === 'Diariamente' ? 'Diariamente' : 'Nunca', // Corrigido para enviar string
              penalidadeIds: selectedPenalties,
              userId: JSON.parse(userID),
              // Não envia o prazo se a repetição for 'Diariamente'
              ...(repetition !== 'Diariamente' && { prazo: formattedDeadline }),
            });
    
            const response = await axios.put(`${API_URL}/api/missionapi/update/${mission.id}`, {
              titulo: title,
              rank,
              dificuldade: difficulty,
              repeticao: repetition === 'Diariamente' ? 'Diariamente' : 'Nunca', // Corrigido para enviar string
              penalidadeIds: selectedPenalties,
              userId: JSON.parse(userID),
              // Envia o prazo apenas se a repetição não for 'Diariamente'
              ...(repetition !== 'Diariamente' && { prazo: formattedDeadline }),
            });
    
            Alert.alert('Missão Editada', response.data.message);
            onSave();
            onClose();
          } else {
            Alert.alert('Erro', 'Usuário não encontrado. Por favor, faça login novamente.');
          }
        } catch (error) {
          console.error('Erro ao editar missão:', error);
          Alert.alert('Erro ao editar missão', error.response.data.error || 'Erro desconhecido.');
        }
      } else {
        Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione pelo menos uma penalidade.');
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
                    <Text className="text-white text-2xl font-semibold mb-6">Editar Missão</Text>
                    
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
                        <Picker.Item label="B" value="B" />
                        <Picker.Item label="A" value="A" />
                        <Picker.Item label="S" value="S" />
                        <Picker.Item label="SS" value="SS" />
                        <Picker.Item label="SSS" value="SSS" />
                        <Picker.Item label="SSS+" value="SSS+" />
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
                                setDeadline(selectedDate);
                              }
                            }}
                            minimumDate={moment().add(1, 'day').toDate()}
                          />
                        
                        )}
                      </>
                    )}

                    

                    {/* Exibir penalidades já vinculadas */}
                    <Text className="text-white mb-1 text-xl">Penalidades Vinculadas</Text>
                    <FlatList
                      data={penalties.filter((penalty) => selectedPenalties.includes(penalty.id))}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => togglePenaltySelection(item.id)} className="flex-row items-center p-2">
                          <Text className="text-white">{item.titulo} (Vinculada)</Text>
                          <Text className="ml-auto text-white">✓</Text>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={<Text className="text-gray-400">Nenhuma penalidade vinculada</Text>} 
                    />

                    {/* Exibir penalidades disponíveis */}
                    <Text className="text-white mb-1 text-xl">Penalidades Disponíveis</Text>
                    <FlatList
                      data={penalties.filter((penalty) => !penalty.missionId || penalty.missionId === mission.id)}
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

                    <TouchableOpacity onPress={handleEditMission} className="py-3 bg-yellow-400 rounded-xl mt-4">
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
