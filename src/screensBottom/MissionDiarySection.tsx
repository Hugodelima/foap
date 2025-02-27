import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';

import filter from '../assets/images/mission/filter.png'
import { PencilIcon, TrashIcon, CheckIcon } from 'react-native-heroicons/outline';

import axios from 'axios';
import { API_URL } from '@env';

import { getUserId } from './ProgressScreen';

import MissionModal from '../modal/MissionModal';

import MissionFilterModal from '../hooks/modalFilterMission';
import ConfirmationModal from '../modal/ConfirmationModal';

interface Mission{
    id: number;
    titulo: string;
    rank: string;
    prazo: string;
    repeticao:string
    dificuldade: string;
    valorXp: number;
    valorOuro: number;
    valorPd: number;
    situacao: string;
    penalidades: [];
    penaltyCount: number;
    penaltyTitles: [];
  }

export default function MissionSection(){
    const [filterModalVisibleMission, setFilterModalVisibleMission] = useState(false);

    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    const [modalVisibleMission, setModalVisibleMission] = useState(false);

    const [missions, setMissions] = useState<Mission[]>([]);
    const [filterMissionStatus, setFilterMissionStatus] = useState<string | null>(null);
    const filteredMissions = filterMissionStatus ? missions.filter((mission) => mission.situacao === filterMissionStatus) : missions;
    const [modalVisible, setModalVisible] = useState(false);

    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);

    const executeDelete = () => {
        if (deleteAction) {
          deleteAction();
          setModalVisible(false);
        }
    };

    useEffect(() => {
        fetchMissionsDiary(); // Adicionado para carregar missões
        checkExpiredMissions()
        checkDailyMissions()

        const interval = setInterval(() => {
          fetchMissionsDiary(); // Atualiza periodicamente as missões
          checkExpiredMissions()
          checkDailyMissions()
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const checkDailyMissions = async () => {
        try {
          const userId = await getUserId();
          const { data: missions } = await axios.get(`${API_URL}/api/missionapi/daily-missions/${userId}`);
          missions.forEach(resetDailyMission);
        } catch (error) {
          console.error('Erro ao verificar missões diárias:', error);
        }
    };

    const resetDailyMission = async (mission) => {
        const currentTime = new Date();
        //currentTime.setDate(currentTime.getDate() + 2); deixar para testar
      
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
              situacao: "Em progresso", // Atualiza o status da missão
            });
      
            // Resetando o status das penalidades associadas à missão
            await axios.put(`${API_URL}/api/penaltyapi/reset/${mission.id}`);
      
            // Verifica se a missão foi completada anteriormente
            const missionStatus = mission.situacao; // Supondo que a missão tenha um status de "Completada" ou "Pendente"
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
                id_missao: mission.id,
                id_usuario: mission.id_usuario,
                completado: isCompleted, // Marca como completada no primeiro dia
                prazoAnterior: dayStart.toISOString(),
                prazoAtualizado: dayEnd.toISOString(),
                valorXp: mission.valorXp,
                valorOuro: mission.valorOuro,
                valorPd: mission.valorPd,
              });
      
              console.log('Histórico registrado para o dia: ' + dayStart.toISOString());
            }
      
            console.log('Prazo atualizado: ' + updatedPrazo.toISOString());
          } catch (error) {
            console.error('Erro ao atualizar missão:', error);
          }
        }
    };

    const checkExpiredMissions = async () => {
        try {
          const userId = await getUserId();
          const response = await axios.get(`${API_URL}/api/missionapi/${userId}`);
          const missions = response.data;
  
          missions.forEach(async (mission: Mission) => {
            const timeRemaining = calculateTimeRemaining(mission.prazo);
            if (timeRemaining === 'Missão Expirada' && mission.situacao === 'Em progresso') {
              await axios.put(`${API_URL}/api/missionapi/expire/${mission.id}`, { id_usuario: userId });
              Alert.alert('Missão expirada!', `A missão "${mission.titulo}" foi marcada como não finalizada.`);
            }
          });
  
          fetchMissionsDiary(); // Atualiza a lista de missões
        } catch (error) {
          console.error('Erro ao verificar missões expiradas:', error);
        }
    };
  

    const handleOpenMissionFilterModal = () => {
        setFilterModalVisibleMission(true);
    };

    const handleCreateMission = () => {
        setSelectedMission(null);
        setModalVisibleMission(true)
    };

    function calculateTimeRemaining(prazo: string): string {
        // Criar a data com base no prazo recebido
        const prazoDate = new Date(prazo);
        
        // Ajustar o prazo subtraindo 4 horas (corrigindo o deslocamento indevido)
        prazoDate.setHours(prazoDate.getHours() - 4);
    
        
        // Obter a data e hora atuais
        const now = new Date();
        now.setHours(now.getHours() - 4); // Ajustar o horário atual para Cuiabá
    
        // Calcular a diferença em milissegundos
        const diffInMilliseconds = prazoDate.getTime() - now.getTime();
    
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

    const handleEditMission = (mission) => {
        setSelectedMission(mission);
        setModalVisibleMission(true);
    };

    const confirmDelete = (action: () => void) => {
        setDeleteAction(() => action);
        setModalVisible(true);
    };

    const fetchMissionsDiary = async () => {
        try {
          const userId = await getUserId();
          const response = await axios.get(`${API_URL}/api/missionapi/daily-missions-penalties/${userId}`);
          setMissions(response.data);
        } catch (error) {
          console.error('Erro ao buscar missões:', error);
        }
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
    
        fetchMissionsDiary()
    }

    const handleDeleteMission = (missionId: number) => {
        confirmDelete(async () => {
          try {
            await axios.delete(`${API_URL}/api/missionapi/delete/${missionId}`);
            Alert.alert('Missão excluída com sucesso!');
            fetchMissionsDiary();
          } catch (error: any) {
            console.error('Erro ao excluir missão:', error);
            Alert.alert('Erro ao excluir missão', error.response?.data?.message || 'Erro ao tentar excluir.');
          }
        });
    };

    const handleMissionFilterSelection = (status: string) => {
        setFilterMissionStatus(status === 'todos' ? null : status);
        setFilterModalVisibleMission(false);
    };

    return (
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
                    <Text className="text-white font-vt323">Situação: {item.situacao}</Text>
                    <Text className="text-white font-vt323">Dificuldade: {item.dificuldade}</Text>
                    <Text className="text-white font-vt323">Rank: {item.rank}</Text>
                    <Text className="text-white font-vt323">
                        Tempo Restante: {calculateTimeRemaining(item.prazo)}
                    </Text>
                    <Text className="text-white font-vt323">
                        Repetição: {item.repeticao}
                    </Text>
                    <Text className="text-white font-vt323 mb-4">
                        Recompensas: XP: {item.valorXp}, Ouro: {item.valorOuro}, PD: {item.valorPd}
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
                          {item.situacao !== "Finalizada" && item.situacao !== "Não finalizada" && (
                            <>
                              <TouchableOpacity onPress={() => handleEditMission(item)} className="mr-4">
                                <PencilIcon size={30} color="orange" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteMission(item.id)} className="mr-4">
                                <TrashIcon size={30} color="red" />
                              </TouchableOpacity>
                            </>
                          )}
                            
                            
                            </View>
                            {item.situacao == 'Em progresso' && (
                            <TouchableOpacity onPress={async () => handleCompleteMission(item.id, await getUserId())}>
                                <CheckIcon size={30} color="green" />
                            </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            />
            
            

            <TouchableOpacity className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5' onPress={handleCreateMission}>
                <Text className='text-white text-center font-vt323'>Criar Nova Missão</Text>
            </TouchableOpacity>

            <MissionFilterModal
                visible={filterModalVisibleMission}
                onClose={() => setFilterModalVisibleMission(false)}
                onFilter={handleMissionFilterSelection}
            />
            <MissionModal
                visible={modalVisibleMission}
                onClose={() => setModalVisibleMission(false)}
                onSave={fetchMissionsDiary} // Atualiza a lista após salvar
                mission={selectedMission} // Se for edição, passa a missão, senão é null
                diary={true}
            />

            <ConfirmationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={executeDelete}
                message="Tem certeza que deseja excluir este item?"
            />


        </View>
    )
}