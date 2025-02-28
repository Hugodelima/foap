import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';

import filter from '../assets/images/mission/filter.png'
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon } from 'react-native-heroicons/outline';

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
        fetchMissions(); // Adicionado para carregar missões
        checkExpiredMissions()

        const interval = setInterval(() => {
          fetchMissions(); // Atualiza periodicamente as missões
          checkExpiredMissions()
        }, 10000);

        return () => clearInterval(interval);
    }, []);

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
  
          fetchMissions(); // Atualiza a lista de missões
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
    function calculateMinimumExecutionTime(prazo: string): string {
      const prazoDate = new Date(prazo);
      prazoDate.setHours(prazoDate.getHours() - 4); // Ajuste de fuso
  
      const now = new Date();
      now.setHours(now.getHours() - 4); // Ajuste para Cuiabá
  
      const totalMilliseconds = prazoDate.getTime() - now.getTime();
      const minExecutionMilliseconds = totalMilliseconds * 0.6; // 🔹 60% do prazo total
  
      if (minExecutionMilliseconds <= 0) {
          return "Tempo mínimo atingido";
      }
  
      const minExecutionMinutes = Math.floor(minExecutionMilliseconds / 60000);
      const hours = Math.floor(minExecutionMinutes / 60);
      const minutes = minExecutionMinutes % 60;
  
      return `${hours}h ${minutes}m`;
    }
    function calculateMinimumTimeRemaining(prazo: string, dataInicio?: string): string {
      const inicioDate = new Date(dataInicio);
      const prazoDate = new Date(prazo);
    
      // Ajustar para o fuso horário de Cuiabá
      inicioDate.setHours(inicioDate.getHours() - 4);
      prazoDate.setHours(prazoDate.getHours() - 4);
    
      const totalMilliseconds = prazoDate.getTime() - inicioDate.getTime();
      const minExecutionMilliseconds = totalMilliseconds * 0.6;
    
      const prazoMinimo = new Date(inicioDate.getTime() + minExecutionMilliseconds);
      const now = new Date();
      now.setHours(now.getHours() - 4);
    
      const diffInMilliseconds = prazoMinimo.getTime() - now.getTime();
    
    
      const totalMinutes = Math.floor(diffInMilliseconds / 60000);
      const days = Math.floor(totalMinutes / 1440); // 1440 minutos em um dia
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
    
      // Monta o retorno apenas com valores diferentes de zero
      const timeParts = [];
      if (days > 0) timeParts.push(`${days} dia${days > 1 ? "s" : ""}`);
      if (hours > 0) timeParts.push(`${hours} hora${hours > 1 ? "s" : ""}`);
      if (minutes > 0) timeParts.push(`${minutes} minuto${minutes > 1 ? "s" : ""}`);
    
      return timeParts.join(", ");
    }
    
    

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

    const fetchMissions = async () => {
        try {
          const userId = await getUserId();
          const response = await axios.get(`${API_URL}/api/missionapi/${userId}`);
          setMissions(response.data);
        } catch (error) {
          console.error('Erro ao buscar missões:', error);
        }
    };//16 e 48 minutos
    const handleStartMission = async (missionId: number, prazoFinal: string, criado_em: string) => {
      try {
        const agora = new Date();
        //const agora = new Date("2025-02-28T18:28:09-04:00");
        const prazoFinalDate = new Date(prazoFinal);
        const criadoEmDate = new Date(criado_em); 
        //console.log('agora: '+agora)
        //console.log('prazoFinalDate: '+prazoFinalDate)
        //console.log('criadoEmDate: '+criadoEmDate)
    
        const prazoTotalMs = prazoFinalDate.getTime() - criadoEmDate.getTime();
        
        const tempoMinimoMs = prazoTotalMs * 0.6;
    
        const tempoRestanteMs = prazoFinalDate.getTime() - agora.getTime();
    
        //console.log(`Prazo total: ${prazoTotalMs / 1000 / 60 / 60} horas`);
        //console.log(`Tempo mínimo necessário: ${tempoMinimoMs / 1000 / 60 / 60} horas`);
        //console.log(`Tempo restante: ${tempoRestanteMs / 1000 / 60 / 60} horas`);
    

        if (tempoRestanteMs < tempoMinimoMs) {
          Alert.alert("Tempo restante insuficiente.");
          return; 
        }
    
        const response = await axios.put(`${API_URL}/api/missionapi/start/${missionId}`);
    
        if (response.status === 200) {
          setMissions((prevMissions) =>
            prevMissions.map((mission) =>
              mission.id === missionId ? { ...mission, iniciado: true } : mission
            )
          );
          Alert.alert("Missão iniciada com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao iniciar missão:", error);
      }
    };
    

    
    
  

    async function handleCompleteMission(missionId, criadoEm, prazoFinal, userId) {
      try {
        const inicioDate = new Date(criadoEm);
        const prazoDate = new Date(prazoFinal);
    
        // Ajustar para o fuso horário de Cuiabá
        inicioDate.setHours(inicioDate.getHours());
        prazoDate.setHours(prazoDate.getHours());
        console.log('inicioDate: '+inicioDate)
        console.log('prazoDate: '+prazoDate)
        // Cálculo de 60% do tempo total da missão
        const totalMilliseconds = prazoDate.getTime() - inicioDate.getTime();
        const minExecutionMilliseconds = totalMilliseconds * 0.6;
        const prazoMinimo = new Date(inicioDate.getTime() + minExecutionMilliseconds);
    
        const now = new Date();
        //const now = new Date("2025-02-28T18:28:09-04:00");
        console.log('now: '+now)
    
        // Se ainda não atingiu o tempo mínimo, barrar a conclusão
        if (now < prazoMinimo) {
          const tempoRestante = calculateMinimumTimeRemaining(prazoFinal, criadoEm);
          Alert.alert('Atenção', `Ainda não é possível concluir a missão.\nTempo restante: ${tempoRestante}`);
          return;
        }
    
        // Se passou do tempo mínimo, permite a conclusão
        const response = await axios.put(`${API_URL}/api/missionapi/complete/${missionId}`, { userId,now });
        const { message } = response.data;
        Alert.alert('Sucesso', message);
        
        fetchMissions();
      } catch (error) {
        console.error('Erro ao completar missão:', error);
        Alert.alert('Erro', error.response?.data?.error || 'Não foi possível completar a missão.');
      }
    }

    const handleDeleteMission = (missionId: number) => {
        confirmDelete(async () => {
          try {
            await axios.delete(`${API_URL}/api/missionapi/delete/${missionId}`);
            Alert.alert('Missão excluída com sucesso!');
            fetchMissions();
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
                          {item.situacao !== "Finalizada" && item.situacao !== "Não finalizada" && item.iniciado !==  true &&(
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
                            {item.situacao === 'Em progresso' && (
                              item.iniciado ? (
                                  <TouchableOpacity onPress={async () => handleCompleteMission(item.id, item.criado_em, item.prazo, await getUserId())}>
                                      <CheckIcon size={30} color="green" />
                                  </TouchableOpacity>
                              ) : (
                                  <TouchableOpacity onPress={() => handleStartMission(item.id, item.prazo, item.criado_em)}>
                                      <PlayIcon size={30} color="green" />
                                  </TouchableOpacity>
                              )
                            )}
                        </View>
                        {item.iniciado && (
                          <Text className="text-yellow-400 font-vt323">
                              Tempo mínimo restante (60%): {calculateMinimumTimeRemaining(item.prazo, item.registroInicio)}
                          </Text>
                        )}
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
                onSave={fetchMissions} // Atualiza a lista após salvar
                mission={selectedMission} // Se for edição, passa a missão, senão é null
                diary={false}
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