import React, { useState, useEffect } from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity, TextInput, Alert, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';

interface Penalty {
  id: string;
  titulo: string;
  missionId: string | null;
}

interface ModalComponentProps {
  visible: boolean;
  mission: any | null; // Passar a missão para editar (caso exista)
  onClose: () => void;
  onSave: () => void;
  diary: boolean
}

export default function ModalMission({ visible, mission, onClose, onSave, diary }: ModalComponentProps) {

  const { userData } = useFetchStatusUser();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Fácil');
  const [rank, setRank] = useState('F');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [selectedPenalties, setSelectedPenalties] = useState<string[]>([]);
  const [repetition, setRepetition] = useState(diary ? 'Diariamente' : 'Nunca' ); 

  const availableRanks = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'];

  // Filtrar os ranks disponíveis com base no rank atual do usuário
  const userRankIndex = availableRanks.indexOf(userData?.rank);
  const filteredRanks = availableRanks.slice(0, userRankIndex + 1);

  useEffect(() => {
    if (visible) {
      const fetchPenalties = async () => {
        try {
          const userID = await SecureStore.getItemAsync('userStorageID');
          const response = await axios.get(`${API_URL}/api/penaltyapi/all/${userID}`);
  
          // Filtrar penalidades vinculadas à missão e as que não têm missionId
          const linkedPenalties = mission
            ? response.data.penalties.filter((penalty: Penalty) => penalty.id_missao === mission.id)
            : [];
          const availablePenalties = response.data.penalties.filter((penalty: Penalty) => !penalty.id_missao);
  
          setPenalties([...linkedPenalties, ...availablePenalties]);
  
          // Marcar as penalidades vinculadas como selecionadas
          setSelectedPenalties(linkedPenalties.map((penalty: Penalty) => penalty.id));
        } catch (error) {
          console.error('Erro ao buscar penalidades:', error);
          Alert.alert('Erro', 'Não foi possível carregar as penalidades.');
        }
      };
  
      fetchPenalties();
  
      if (mission) {
        setTitle(mission.titulo);
        setDifficulty(mission.dificuldade);
        setRank(mission.rank);
        setRepetition(mission.repeticao);
        setDeadline(mission.prazo ? new Date(mission.prazo) : new Date());
      }
    }
  }, [visible, mission]);
  
  const togglePenaltySelection = (penaltyId: string) => {
    setSelectedPenalties((prevSelected) =>
      prevSelected.includes(penaltyId)
        ? prevSelected.filter((id) => id !== penaltyId)
        : [...prevSelected, penaltyId]
    );
  };

  const handleSaveMission = async () => {
    if (title && difficulty && rank && selectedPenalties.length > 0) {
      const tomorrow = moment().add(1, 'day').startOf('day');
  
      // Validação adicional para o prazo
      if (repetition === 'Nunca' && moment(deadline).isBefore(tomorrow)) {
        Alert.alert(
          'Erro',
          'O prazo deve ser a partir de amanhã quando a repetição for "Nunca".'
        );
        return;
      }
  
      try {
        const userID = await SecureStore.getItemAsync('userStorageID');
        if (userID) {
          const formattedDeadline = repetition === 'Diariamente'
            ? moment().endOf('day').format() // Enviar o fim do dia atual como prazo
            : moment(deadline).format('YYYY-MM-DD');
          
          const missionData = {
            titulo: title,
            rank,
            prazo: formattedDeadline,
            dificuldade: difficulty,
            penalidadeIds: selectedPenalties,
            repeticao: repetition,
            id_usuario: JSON.parse(userID),
            // Não envia o prazo se a repetição for 'Diariamente'
            ...(repetition !== 'Diariamente' && { prazo: formattedDeadline }),
          };

          let response;
          if (mission) {
            // Edição de missão
            response = await axios.put(`${API_URL}/api/missionapi/update/${mission.id}`, missionData);
            Alert.alert('Missão Editada', response.data.message);
          } else {
            // Criação de missão
            response = await axios.post(`${API_URL}/api/missionapi/create`, missionData);
            // Pegamos a data de agora (momento da criação da missão)
            const now = new Date();
            now.setHours(now.getHours() - 4);// ajustado para horario de cuiaba
            console.log("Data atual (now):", now);

            const prazoFinal = new Date(missionData.prazo);
            prazoFinal.setUTCHours(23, 59, 59, 999); // ajustado para horario de cuiaba
            console.log("Prazo final (prazoFinal):", prazoFinal);

            const intervaloTotal = prazoFinal - now;
            console.log("Intervalo total em ms:", intervaloTotal);

            const prazoMinimoMs = now.getTime() + intervaloTotal * 0.6;
            const prazoMinimo = new Date(prazoMinimoMs);
            console.log("Prazo mínimo em ms:", prazoMinimoMs);
            console.log("Prazo mínimo (prazoMinimo):", prazoMinimo);

            // Calculamos a diferença entre o prazo mínimo e agora
            const diffInMilliseconds = prazoMinimo - now;
            console.log("Diferença entre agora e o prazo mínimo (ms):", diffInMilliseconds);

            const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
            const diffInHours = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffInMinutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

            console.log(`Tempo mínimo para conclusão: ${diffInDays} dias, ${diffInHours} horas e ${diffInMinutes} minutos`);

            // Formatar mensagem do alerta
            const prazoMinimoString = `${diffInDays} dias, ${diffInHours} horas e ${diffInMinutes} minutos`;

            Alert.alert(
              'Missão Criada',
              `${response.data.message}`,
            );
          }
  
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
        console.error('Erro ao salvar missão:', error);
        Alert.alert('Erro ao salvar missão', error.response?.data?.message || 'Erro desconhecido.');
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
                  <Text className="text-white text-2xl font-semibold mb-6">{mission ? 'Editar Missão Existente' : 'Adicionar Nova Missão'}</Text>
                  
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
                      {filteredRanks.map((rankOption) => (
                        <Picker.Item key={rankOption} label={rankOption} value={rankOption} />
                      ))}
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
                          value={moment(deadline).format('DD-MM-YYYY')}
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

                  <Text className="text-white mb-1 text-xl">Penalidades</Text>
                  <FlatList
                    data={penalties}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => togglePenaltySelection(item.id)} className="flex-row items-center p-2">
                        <Text className="text-white">
                          {item.titulo} {selectedPenalties.includes(item.id) ? '(Vinculada)' : ''}
                        </Text>
                        <Text className="ml-auto text-white">
                          {selectedPenalties.includes(item.id) ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text className="text-gray-400">Nenhuma penalidade disponível</Text>}
                  />



                 

                  <TouchableOpacity onPress={handleSaveMission} className="py-3 bg-blue-400 rounded-xl mt-4">
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
