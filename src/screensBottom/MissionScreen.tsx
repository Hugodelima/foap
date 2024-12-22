import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { useFetchUserData } from '../hooks/useFetchDataUser';
import ModalComponent from '../modal/moreOptions';
import ModalReward from '../modal/addReward';
import ModalEditReward from '../modal/editReward'; // Modal para editar a recompensa
import ModalEditMission from '../modal/editMission'
import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';
import moreOptions_image from '../assets/images/home/more_options.png';
import * as SecureStore from 'expo-secure-store';
import filter from '../assets/images/mission/filter.png'
import ModalFilter from '../hooks/modalFilterReward';
import { PencilIcon, TrashIcon, ShoppingCartIcon, CheckIcon } from 'react-native-heroicons/outline';
import ModalPenalty from '../modal/addPenalty'
import { NavigationProps } from '../navigation/types';
import ModalFilterPenalty from '../hooks/modalFilterPenalty';
import EditPenaltyModal from '../modal/editPenalty';
import MissionFilterModal from '../hooks/modalFilterMission';
import ModalMission from '../modal/addMission';

interface Reward {
  id: number;
  titulo: string;
  gold: number;
  status: string;
}

interface Penalty {
  id: number;
  titulo: string;
  status: string;
  dificuldade: string;
  rank: string;
  perdaOuro: number;
  perdaXp: number;
}

interface Mission{
  id: number;
  titulo: string;
  rank: string;
  prazo: Date;
  dificuldade: string;
  recompensaXp: number;
  recompensaOuro: number;
  recompensaPd: number;
  status: string;
  penalidades: [];
  penaltyCount: number;
  penaltyTitles: [];
}


async function getUserId() {
  const userID = await SecureStore.getItemAsync('userStorageID');
  return userID;
}

export default function MissionScreen() {
  
  const [modalVisibleOption, setModalVisibleOption] = useState(false);
  const [modalVisibleReward, setModalVisibleReward] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false); // Modal para editar
  const [modalVisibleEditPenalty, setModalVisibleEditPenalty] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null); // Armazena a recompensa selecionada
  const [selectedSection, setSelectedSection] = useState<string>('missao');
  const { userData, setUserData } = useFetchUserData();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const navigation = useNavigation<NavigationProps>();
  const [filterModalVisible, setFilterModalVisible] = useState(false); // Controla o modal
  const [filterStatus, setFilterStatus] = useState<string | null>('em aberto'); // 'aberta' ou 'comprada'
  const filteredRewards = filterStatus
  ? rewards.filter((reward) => reward.status === filterStatus)
  : rewards;

  //penalidades
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [modalVisiblePenalty, setModalVisiblePenalty] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [filterModalVisiblePenalty, setFilterModalVisiblePenalty] = useState(false);
  const [filterPenaltyStatus, setFilterPenaltyStatus] = useState<string | null>(''); 
  const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const filteredPenalties = filterPenaltyStatus
  ? penalties.filter((penalty) => penalty.status === filterPenaltyStatus)
  : penalties;


  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [modalVisibleEditMission, setModalVisibleEditMission] = useState(false)
  const [modalVisibleMission, setModalVisibleMission] = useState(false);
  

  const handleOpenPenaltyFilterModal = () => {
    setFilterModalVisiblePenalty(true);
  };

  const handleFilterSelection = (status: string) => {
    setFilterStatus(status === 'todos' ? '' : status); // Define como vazio se for "todos"
    setFilterModalVisible(false); // Fecha o modal após a seleção
  };
  
  const handlePenaltyFilterSelection = (status: string) => {
    setFilterPenaltyStatus(status === 'todos' ? '' : status);
    setFilterModalVisiblePenalty(false); 
  };
  


  const handleOpenFilterModal = () => {
    setFilterModalVisible(true);
  };
  
  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

 
  
  
  
  const fetchRewards = async () => {
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/rewardapi/${userId}`);
      setRewards(response.data);
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
    }
  };

  const fetchPenalties = async () => {
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/penaltyapi/${userId}`); // Substitua com sua rota
      setPenalties(response.data);
    } catch (error) {
      console.error('Erro ao buscar penalidades:', error);
    }
  };

  const fetchMissions = async () => {
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/missionapi/${userId}`);
      setMissions(response.data);
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
    }
  };
  
  

  useEffect(() => {
    fetchRewards();
    fetchPenalties();
    fetchMissions(); // Adicionado para carregar missões
    const interval = setInterval(() => {
      fetchRewards();
      fetchPenalties();
      fetchMissions(); // Atualiza periodicamente as missões
    }, 10000);
  
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkExpiredMissions = async () => {
      try {
        const userId = await getUserId();
        const response = await axios.get(`${API_URL}/api/missionapi/${userId}`);
        const missions = response.data;

        missions.forEach(async (mission: Mission) => {
          const timeRemaining = calculateTimeRemaining(mission.prazo);
          if (timeRemaining === 'Missão Expirada' && mission.status === 'Em progresso') {
            await axios.put(`${API_URL}/api/missionapi/expire/${mission.id}`, { userId });
            Alert.alert('Missão expirada!', `A missão "${mission.titulo}" foi marcada como não finalizada.`);
          }
        });

        fetchMissions(); // Atualiza a lista de missões
      } catch (error) {
        console.error('Erro ao verificar missões expiradas:', error);
      }
    };

    const interval = setInterval(() => {
      checkExpiredMissions();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  

  

  

// Adicione o estado do modal de filtro
const [filterModalVisibleMission, setFilterModalVisibleMission] = useState(false);
const [filterMissionStatus, setFilterMissionStatus] = useState<string | null>(null);

// Função para abrir o modal de filtro de missões
const handleOpenMissionFilterModal = () => {
  setFilterModalVisibleMission(true);
};

// Função para selecionar o status do filtro
const handleMissionFilterSelection = (status: string) => {
  setFilterMissionStatus(status === 'todos' ? null : status);
  setFilterModalVisibleMission(false);
};
const [missions, setMissions] = useState<Mission[]>([]);
// Filtra as missões com base no status selecionado
const filteredMissions = filterMissionStatus ? missions.filter((mission) => mission.status === filterMissionStatus) : missions;

const handleCreateMission = () => {
  setModalVisibleMission(true)
};

const handleMissionCreated = () => {
  setModalVisibleMission(false);
  fetchMissions(); // Atualiza a lista de missões após a criação
};
const handleEditMission = (mission: Mission) => {
  setSelectedMission(mission);
  setModalVisibleEditMission(true); // abre o modal de edição de missão (caso tenha)
};

const handleMissionEdited = () => {
  setModalVisibleEditMission(false);
  fetchMissions(); // Atualiza a lista de missões após a edição
};
const handleDeleteMission = async (missionId: number) => {
  try {
    await axios.delete(`${API_URL}/api/missionapi/delete/${missionId}`);
    Alert.alert('Missão excluída com sucesso!');
    fetchMissions(); 
  } catch (error: any) {
    console.error('Erro ao excluir missão:', error);
    Alert.alert('Erro ao excluir missão', error.response?.data?.message || 'Erro ao tentar excluir.');
  }
};

  const handleBuyReward = async (rewardId: number, goldCost: number) => {
    try {
        const userId = await getUserId(); // Obtém o ID do usuário
        if (userData?.ouro >= goldCost) {
            const response = await axios.post(`${API_URL}/api/rewardapi/buy/${rewardId}`, { 
                userId, // Passa o ID do usuário
                goldCost // Passa o custo da recompensa
            });
            
            setUserData({ ...userData, ouro: userData?.ouro - goldCost });
            Alert.alert('Compra realizada com sucesso!');
            fetchRewards();
        } else {
            Alert.alert('Saldo insuficiente de ouro!');
        }
    } catch (error: any) {
        console.error('Erro ao comprar recompensa:', error);
        Alert.alert('Erro ao comprar recompensa', error.response?.data?.message || 'Erro ao tentar comprar.');
    }
  };

  function calculateTimeRemaining(prazo: string): string {
    // Fuso horário de Cuiabá (UTC -4)
    const cuiabaOffset = 4 * 60; // UTC-4 = 240 minutos de diferença

    // Dividir a data e hora do prazo recebido
    const prazoParts = prazo.split("T");
    const dateParts = prazoParts[0].split("-"); // Ano, mês, dia
    const timeParts = prazoParts[1].split(":"); // Hora, minuto, segundo
    
    // Ajustar o prazo para 23:59:59 UTC
    let prazoUTC = new Date(Date.UTC(
        parseInt(dateParts[0]), // Ano
        parseInt(dateParts[1]) - 1, // Mês começa do 0 no JavaScript
        parseInt(dateParts[2]), // Dia
        23, // Hora 23
        59, // Minuto 59
        59  // Segundo 59
    ));



    // Ajustar o horário para Cuiabá (acrescentando 4 horas)
    prazoUTC.setHours(prazoUTC.getHours()); // Adicionando 4 horas para o horário de Cuiabá


    // Obter a data e hora atuais (considerando UTC-4)
    const now = new Date();
    now.setHours(now.getHours() - 4); // Ajustar o horário atual para Cuiabá


    // Calcular a diferença em milissegundos
    const diffInMilliseconds = prazoUTC.getTime() - now.getTime();

    // Se a diferença for negativa ou zero, significa que o prazo já passou
    if (diffInMilliseconds <= 0) {
      return "Missão Expirada";
    }

    // Converter a diferença em minutos
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const remainingDays = Math.floor(diffInMinutes / 1440); // 1 dia tem 1440 minutos
    const remainingHours = Math.floor((diffInMinutes % 1440) / 60);
    const remainingMinutes = diffInMinutes % 60;

    // Exibir o tempo restante
    const formattedTime = `${remainingDays > 0 ? `${remainingDays}d ` : ''}${remainingHours}h ${remainingMinutes}m`;

    return formattedTime;

  }

    const handleCreateReward = () => {
      setModalVisibleReward(true);
    };

    const handleRewardCreated = () => {
      setModalVisibleReward(false);
      fetchRewards();
    };
    const handleCreatePenalty = () => {
      setModalVisiblePenalty(true);
    };
    
    const handlePenaltyCreated = () => {
      setModalVisiblePenalty(false);
      fetchPenalties(); // Atualiza as penalidades após a criação
    };
    

    const handleEditReward = (reward: Reward) => {
      setSelectedReward(reward); // Define a recompensa a ser editada
      setModalEditVisible(true); // Abre o modal de edição
    };

    async function handleCompleteMission(missionId, userId) {

      try {
        const response = await axios.put(`${API_URL}/api/missionapi/complete/${missionId}`, { userId });
        const { message } = response.data;
        Alert.alert('Sucesso', message);
      } catch (error) {
        console.error('Erro ao completar missão:', error);
        Alert.alert('Erro', error.response?.data?.error || 'Não foi possível completar a missão.');
      }

      fetchMissions()
  }


    const handleRewardEdited = () => {
      setModalEditVisible(false);
      fetchRewards(); // Atualiza as recompensas após a edição
    };
    const handlePenaltyEdited = () => {
      setModalVisibleEditPenalty(false);
      fetchPenalties(); // Atualiza as recompensas após a edição
    };


    const handleEditPenalty = (penalty: Penalty) => {
      setSelectedPenalty(penalty)
      setModalVisibleEditPenalty(true)
    };

    const handleOvercomePenalty = async (penaltyId: number) => {
      try {
        const response = await axios.put(`${API_URL}/api/penaltyapi/overcome/${penaltyId}`);
        if (response.status === 200) {
          Alert.alert('Sucesso', response.data.message);
          
        }
      } catch (error: any) {
        console.error('Erro ao superar penalidade:', error);
        Alert.alert('Erro', error.response?.data?.error || 'Erro ao superar penalidade.');
      }
    };
    

    const handleDeleteReward = async (rewardId: number) => {
      try {
        await axios.delete(`${API_URL}/api/rewardapi/delete/${rewardId}`);
        Alert.alert('Recompensa excluída com sucesso!');
        fetchRewards(); // Atualiza a lista de recompensas após a exclusão
      } catch (error: any) {
        console.error('Erro ao excluir recompensa:', error);
        Alert.alert('Erro ao excluir recompensa', error.response?.data?.message || 'Erro ao tentar excluir.');
      }
    };
    const handleDeletePenalty = async (penaltyId: number) => {
      try {
        await axios.delete(`${API_URL}/api/penaltyapi/delete/${penaltyId}`);
        Alert.alert('Penalidade excluída com sucesso!');
        fetchPenalties(); // Atualiza a lista de penalidades após a exclusão
      } catch (error: any) {
        console.error('Erro ao excluir penalidade:', error);
        Alert.alert('Erro ao excluir penalidade', error.response?.data?.message || 'Erro ao tentar excluir.');
      }
    };

    useEffect(() => {
      const checkDailyMissions = async () => {
        try {
          const userId = await getUserId();
          const { data: missions } = await axios.get(`${API_URL}/api/missionapi/daily-missions/${userId}`);
          missions.forEach(resetDailyMission);
        } catch (error) {
          console.error('Erro ao verificar missões diárias:', error);
        }
      };
    
      checkDailyMissions();
    }, []); 
    
  

    

    const resetDailyMission = async (mission) => {
      const currentTime = new Date();
      //currentTime.setDate(currentTime.getDate() + 2);
    
      // Verifica se a missão precisa ser resetada (expiração do prazo)
      const missionDeadline = new Date(mission.prazo);
      if (currentTime > missionDeadline) {
        let updatedPrazo = new Date(currentTime); // Usa o currentTime com 1 dia a mais
        updatedPrazo.setHours(23, 59, 59, 999);
    
        // Ajusta o horário para o fuso horário de Cuiabá (UTC-4)
        const offsetHours = 4; // Horas de diferença para UTC
        updatedPrazo.setUTCHours(updatedPrazo.getUTCHours() - offsetHours);
    
        const prazoAnterior = new Date(mission.prazo);
        const prazoAtualizado = updatedPrazo;
    
        const diffTime = Math.abs(prazoAtualizado - prazoAnterior);
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)); // Diferença em dias
    
        const { recompensaXp, recompensaOuro, recompensaPd } = mission;
    
        try {
          // Atualiza o prazo da missão e o status para "Em progresso"
          await axios.put(`${API_URL}/api/missionapi/update/${mission.id}`, {
            prazo: updatedPrazo.toISOString(),
            status: "Em progresso", // Atualiza o status da missão
          });
    
          // Resetando o status das penalidades associadas à missão
          await axios.put(`${API_URL}/api/penaltyapi/reset/${mission.id}`);
    
          // Verifica se a missão foi completada anteriormente
          const missionStatus = mission.status; // Supondo que a missão tenha um status de "Completada" ou "Pendente"
          const completed = missionStatus === 'Finalizada' ? true : false;
    
          // Controla o registro de histórico: apenas o primeiro dia será "completado" se a missão foi finalizada
          let isCompleted = false;
    
          // Verifica se a missão foi completada em um dia específico
          for (let i = 0; i < diffDays; i++) {
            const dayStart = new Date(prazoAnterior); // Começa com o prazo anterior
            dayStart.setDate(dayStart.getDate() + i); // Incrementa 1 dia
    
            const dayEnd = new Date(dayStart); // Fim do dia
            dayEnd.setHours(23, 59, 59, 999);
    
            // Define se é o dia em que a missão foi completada
            isCompleted = (completed && i === 0); // Apenas o primeiro dia será completado se a missão foi completada
    
            // Adiciona o histórico para o dia específico
            await axios.post(`${API_URL}/api/missionhistorynapi/create`, {
              missionId: mission.id,
              userId: mission.user_id,
              completed: isCompleted, // Marca como completada no primeiro dia
              prazoAnterior: dayStart.toISOString(),
              prazoAtualizado: dayEnd.toISOString(),
              recompensaXp: recompensaXp,
              recompensaOuro: recompensaOuro,
              recompensaPd: recompensaPd,
            });
    
            console.log('Histórico registrado para o dia: ' + dayStart.toISOString());
          }
    
          console.log('Prazo atualizado: ' + updatedPrazo.toISOString());
        } catch (error) {
          console.error('Erro ao atualizar missão:', error);
        }
      }
    };
    
    
    
    
    
    
    
    
    
  
  
    
    
    
    
 
    return (
      <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
        <SafeAreaView className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500'>
          <View className='flex-row items-center mb-4'>
            <View className='flex-row items-center'>
              <Image source={gold_image} style={{ width: 30, height: 30, marginRight: 5 }} />
              <Text className='text-white font-vt323'>{userData?.ouro}</Text>
            </View>
            <View className='flex-row items-center'>
              <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5 }} />
              <Text className='text-white font-vt323'>{userData?.pd}</Text>
            </View>
          </View>

          <View className='flex-row gap-4 mb-4'>
            

            <TouchableOpacity onPress={() => setSelectedSection('missao')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'missao' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
                Missões
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSection('penalidade')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'penalidade' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
                Penalidades
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSection('recompensa')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'recompensa' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
                Recompensas
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        

        <TouchableOpacity className="absolute right-4 top-12" onPress={() => setModalVisibleOption(true)}>
          <Image source={moreOptions_image} className="w-7 h-7" />
        </TouchableOpacity>

        <View className='flex-1'>
          {selectedSection === 'missao' && (
            <>
              <View className='flex-1'>
                <View className="flex items-end">
                  <TouchableOpacity 
                    className='mt-4 mr-4 w-12 h-12 rounded-full'  
                    onPress={handleOpenMissionFilterModal}>
                    <Image source={filter} style={{ width: 50, height: 50 }} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  className="mb-28"
                  data={filteredMissions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View className="p-4 border-b border-neutral-700">
                      <Text className="text-white font-vt323">Título: {item.titulo}</Text>
                      <Text className="text-white font-vt323">Status: {item.status}</Text>
                      <Text className="text-white font-vt323">Dificuldade: {item.dificuldade}</Text>
                      <Text className="text-white font-vt323">Rank: {item.rank}</Text>
                      <Text className="text-white font-vt323">
                        Tempo Restante: {calculateTimeRemaining(item.prazo)}
                      </Text>
                      <Text className="text-white font-vt323">
                        Repetição: {item.repeticao}
                      </Text>
                      <Text className="text-white font-vt323 mb-4">
                        Recompensas: XP: {item.recompensaXp}, Ouro: {item.recompensaOuro}, PD: {item.recompensaPd}
                      </Text>

                      {/* Exibir Penalidades */}
                      <View className="mt-4">
                        <Text className="text-white font-vt323 mb-2">Penalidades:</Text>
                        <Text className="text-neutral-300 font-vt323 mb-2">
                          Total de Penalidades: {item.penaltyCount}
                        </Text>
                        <Text className="text-neutral-300 font-vt323">Títulos:</Text>
                        {item.penaltyTitles && item.penaltyTitles.length > 0 ? (
                          item.penaltyTitles.map((penalidade, index) => (
                            <Text key={index} className="text-neutral-300 font-vt323">
                              - {penalidade}
                            </Text>
                          ))
                        ) : (
                          <Text className="text-neutral-300 font-vt323">Sem penalidades vinculadas.</Text>
                        )}
                      </View>

                      <View className="flex-row justify-between mt-4">
                        <View className="flex-row">
                          <TouchableOpacity onPress={() => handleEditMission(item)} className="mr-4">
                            <PencilIcon size={30} color="orange" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteMission(item.id)} className="mr-4">
                            <TrashIcon size={30} color="red" />
                          </TouchableOpacity>
                        </View>
                        {item.status == 'Em progresso' && (
                          <TouchableOpacity onPress={async () => handleCompleteMission(item.id, await getUserId())}>
                            <CheckIcon size={30} color="green" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                />
                
                <ModalEditMission
                  visible={modalVisibleEditMission}
                  mission={selectedMission}
                  onClose={() => setModalVisibleEditMission(false)}
                  onSave={handleMissionEdited}
                /> 

                <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreateMission}>
                  <Text className='text-white text-center font-vt323'>Criar Nova Missão</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          
          {selectedSection === 'penalidade' && (
            <>
              <View className='flex-1'>
                <View className="flex items-end">
                  <TouchableOpacity 
                    className='mt-4 mr-4 w-12 h-12 rounded-full'  
                    onPress={handleOpenPenaltyFilterModal}>
                    <Image source={filter} style={{width: 50, height: 50}} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  className="mb-28"
                  data={filteredPenalties}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View className="p-4 border-b border-neutral-700">
                      <Text className="text-white font-vt323">Título: {item.titulo}</Text>
                      <Text className="text-white font-vt323">Status: {item.status}</Text>
                      <Text className="text-white font-vt323">Dificuldade: {item.dificuldade}</Text>
                      <Text className="text-white font-vt323">Rank: {item.rank}</Text>
                      <Text className="text-white font-vt323 mb-4">
                        Penalidades: {item.perdaOuro}
                        <Image source={gold_image} style={{ width: 30, height: 30 }} /> {item.perdaXp}
                        <Image source={xp_image} style={{ width: 30, height: 30 }} />
                      </Text>

                      <View className="flex-row justify-between mt-2 mb-2">
                        {/* Botões somente se o status for "Pendente" */}
                        {item.status === 'Pendente' && (
                          <>
                            {/* Botão para Editar Penalidade */}
                            <TouchableOpacity onPress={() => handleEditPenalty(item)} className="mr-4">
                              <PencilIcon size={30} color="orange" />
                            </TouchableOpacity>

                            {/* Botão para Excluir Penalidade */}
                            <TouchableOpacity onPress={() => handleDeletePenalty(item.id)} className="mr-4">
                              <TrashIcon size={30} color="red" />
                            </TouchableOpacity>
                          </>
                        )}

                        {/* Botão para Superar Penalidade se o status for 'Em andamento' */}
                        {item.status === 'Em andamento' && (
                          <TouchableOpacity onPress={() => handleOvercomePenalty(item.id)}>
                            <CheckIcon size={30} color="green" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                />

               

                <EditPenaltyModal
                  visible={modalVisibleEditPenalty}
                  penalty={selectedPenalty}
                  onClose={() => setModalVisibleEditPenalty(false)}
                  onSave={handlePenaltyEdited}
                />
                
                <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreatePenalty}>
                  <Text className='text-white text-center font-vt323'>Criar Nova Penalidade</Text>
                </TouchableOpacity>
              </View>
              
            </>
          )}

          
          {selectedSection === 'recompensa' && (
            <>
              <View className="flex items-end">
                <TouchableOpacity 
                  className='mt-4 mr-4 w-12 h-12 rounded-full'  
                  onPress={handleOpenFilterModal}>
                  <Image source={filter} style={{width: 50, height: 50}} />
                </TouchableOpacity>
              </View>


              <View className='flex-1'>
                <FlatList
                  className='mb-28'
                  data={filteredRewards}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View className='p-4 border-b border-neutral-700'>
                      <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                      <Text className='text-white font-vt323'>Status: {item.status}</Text>
                      <Text className='text-white font-vt323'>Ouro: {item.gold}</Text>

                      {/* Botões para Editar e Excluir */}
                      {item.status !== 'comprada' && (
                        <View className='flex-row justify-between mt-2 mb-2'>
                          
                          <View className='flex-row'>
                            {/* Botão para Editar Recompensa */}
                            <TouchableOpacity onPress={() => handleEditReward(item)} className='mr-4'>
                              <PencilIcon size={30} color="orange" />
                            </TouchableOpacity>

                            {/* Botão para Excluir Recompensa */}
                            <TouchableOpacity onPress={() => handleDeleteReward(item.id)}>
                              <TrashIcon size={30} color="red" />
                            </TouchableOpacity>
                          </View>
                          <View>
                            {/* Botão para Comprar Recompensa, posicionado à direita */}
                            <TouchableOpacity onPress={() => handleBuyReward(item.id, item.gold)}>
                              <ShoppingCartIcon size={30} color="green" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      
                    </View>
                  )}
                />

                

                
                {/* Modal de Criação de Recompensa */}
                <ModalReward
                  visible={modalVisibleReward}
                  onClose={() => setModalVisibleReward(false)}
                  onSave={handleRewardCreated}
                />

                {/* Modal de Edição de Recompensa */}
                <ModalEditReward
                  visible={modalEditVisible}
                  reward={selectedReward || { id: 0, titulo: '', gold: 0, status: '' }} // Passa a recompensa selecionada
                  onClose={() => setModalEditVisible(false)}
                  onSave={handleRewardEdited}
                />

                <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreateReward}>
                  <Text className='text-white text-center font-vt323'>Criar Nova Recompensa</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <ModalComponent visible={modalVisibleOption} onClose={() => setModalVisibleOption(false)} onNavigate={handleNavigate} />

        <ModalFilter
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)} // Fecha o modal
          onFilter={handleFilterSelection} // Função chamada quando uma opção é selecionada
        />
        <ModalFilterPenalty
          visible={filterModalVisiblePenalty}
          onClose={() => setFilterModalVisiblePenalty(false)}
          onFilter={handlePenaltyFilterSelection}
        />

        <ModalPenalty
          visible={modalVisiblePenalty}
          onClose={() => setModalVisiblePenalty(false)}
          onSave={handlePenaltyCreated} // Função que deve ser implementada para criar a penalidade
        />

        <ModalMission
          visible={modalVisibleMission}
          onClose={() => setModalVisibleMission(false)}
          onSave={handleMissionCreated}
        />

        <MissionFilterModal
          visible={filterModalVisibleMission}
          onClose={() => setFilterModalVisibleMission(false)}
          onFilter={handleMissionFilterSelection}
        />
      </View>
    );
  }
