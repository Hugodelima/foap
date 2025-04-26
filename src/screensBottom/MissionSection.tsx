import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, Animated } from 'react-native';

import filter from '../assets/images/mission/filter.png';
import { PencilIcon, TrashIcon, CheckIcon, PlayIcon } from 'react-native-heroicons/outline';

import axios from 'axios';
import { API_URL } from '@env';

import { getUserId } from './ProgressScreen';

import MissionModal from '../modal/MissionModal';
import MissionFilterModal from '../hooks/modalFilterMission';
import ConfirmationModal from '../modal/ConfirmationModal';
import BadgeModal from '../modal/BadgeModal';

interface Mission {
  id: number;
  titulo: string;
  rank: string;
  prazo: string;
  repeticao: string;
  dificuldade: string;
  valorXp: number;
  valorOuro: number;
  valorPd: number;
  situacao: string;
  penalidades: [];
  penaltyCount: number;
  penaltyTitles: [];
  criado_em?: string;
  registroInicio?: string;
  iniciado?: boolean;
}

export default function MissionSection() {
  const [filterModalVisibleMission, setFilterModalVisibleMission] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [modalVisibleMission, setModalVisibleMission] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filterMissionStatus, setFilterMissionStatus] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [modalVisibleBadge, setModalVisibleBadge] = useState(false);
  const [badgesWon, setBadgesWon] = useState([]);
  const [loading, setLoading] = useState(true);

  const skeletonOpacity = useRef(new Animated.Value(0.3)).current;

  const animateSkeleton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const SkeletonBox = ({ height, width, radius = 8, style = {} }) => (
    <Animated.View
      style={{
        backgroundColor: '#444',
        opacity: skeletonOpacity,
        height,
        width,
        borderRadius: radius,
        marginBottom: 10,
        ...style,
      }}
    />
  );

  const executeDelete = () => {
    if (deleteAction) {
      deleteAction();
      setModalVisible(false);
    }
  };
  useEffect(() => {
    animateSkeleton();
  }, []);

  useEffect(() => {
    animateSkeleton();
    fetchMissions();
    checkExpiredMissions();

    const interval = setInterval(() => {
      fetchMissions();
      checkExpiredMissions();
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

      fetchMissions();
    } catch (error) {
      console.error('Erro ao verificar missões expiradas:', error);
    }
  };

  const handleOpenMissionFilterModal = () => {
    setFilterModalVisibleMission(true);
  };

  const handleCreateMission = () => {
    setSelectedMission(null);
    setModalVisibleMission(true);
  };

  function calculateMinimumExecutionTime(prazo: string): string {
    const prazoDate = new Date(prazo);
    prazoDate.setHours(prazoDate.getHours() - 4);
    const now = new Date();
    now.setHours(now.getHours() - 4);
    const totalMilliseconds = prazoDate.getTime() - now.getTime();
    const minExecutionMilliseconds = totalMilliseconds * 0.6;

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
    inicioDate.setHours(inicioDate.getHours() - 4);
    prazoDate.setHours(prazoDate.getHours() - 4);
    const totalMilliseconds = prazoDate.getTime() - inicioDate.getTime();
    const minExecutionMilliseconds = totalMilliseconds * 0.6;
    const prazoMinimo = new Date(inicioDate.getTime() + minExecutionMilliseconds);
    const now = new Date();
    now.setHours(now.getHours() - 4);
    // Verifica se já passou do prazo mínimo de 60%
    if (now >= prazoMinimo) {
      return "Parabéns... Pode concluir a qualquer momento!";
    }
  
    const diffInMilliseconds = prazoMinimo.getTime() - now.getTime();
    const totalMinutes = Math.floor(diffInMilliseconds / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const timeParts = [];
    if (days > 0) timeParts.push(`${days} dia${days > 1 ? "s" : ""}`);
    if (hours > 0) timeParts.push(`${hours} hora${hours > 1 ? "s" : ""}`);
    if (minutes > 0) timeParts.push(`${minutes} minuto${minutes > 1 ? "s" : ""}`);

    return timeParts.join(", ");
  }

  function calculateTimeRemaining(prazo: string): string {
    const prazoDate = new Date(prazo);
    prazoDate.setHours(prazoDate.getHours() - 4);
    const now = new Date();
    now.setHours(now.getHours() - 4);
    const diffInMilliseconds = prazoDate.getTime() - now.getTime();

    if (diffInMilliseconds <= 0) {
      return "Missão Expirada";
    }

    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const remainingDays = Math.floor(diffInMinutes / 1440);
    const remainingHours = Math.floor((diffInMinutes % 1440) / 60);
    const remainingMinutes = diffInMinutes % 60;

    return `${remainingDays > 0 ? `${remainingDays}d ` : ''}${remainingHours}h ${remainingMinutes}m`;
  }

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setModalVisibleMission(true);
  };

  const confirmDelete = (action: () => void) => {
    setDeleteAction(() => action);
    setModalVisible(true);
  };

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/missionapi/${userId}`);
      const missoesComRepeticaoNunca = response.data.filter((missao: Mission) => missao.repeticao === "Nunca");
      setMissions(missoesComRepeticaoNunca);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
      setLoading(false);
    }
  };

  const handleStartMission = async (missionId: number, prazoFinal: string, criado_em: string) => {
    try {
      const agora = new Date();
      const prazoFinalDate = new Date(prazoFinal);
      const criadoEmDate = new Date(criado_em);
      const prazoTotalMs = prazoFinalDate.getTime() - criadoEmDate.getTime();
      const tempoMinimoMs = prazoTotalMs * 0.6;
      const tempoRestanteMs = prazoFinalDate.getTime() - agora.getTime();

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

  async function handleCompleteMission(missionId: number, criadoEm: string, prazoFinal: string, userId: string) {
    try {
      const inicioDate = new Date(criadoEm);
      const prazoDate = new Date(prazoFinal);
      inicioDate.setHours(inicioDate.getHours());
      prazoDate.setHours(prazoDate.getHours());
      const totalMilliseconds = prazoDate.getTime() - inicioDate.getTime();
      const minExecutionMilliseconds = totalMilliseconds * 0.6;
      const prazoMinimo = new Date(inicioDate.getTime() + minExecutionMilliseconds);
      const now = new Date();

      if (now < prazoMinimo) {
        const tempoRestante = calculateMinimumTimeRemaining(prazoFinal, criadoEm);
        Alert.alert('Atenção', `Ainda não é possível concluir a missão.\nTempo restante: ${tempoRestante}`);
        return;
      }

      const response = await axios.put(`${API_URL}/api/missionapi/complete/${missionId}`, { userId, now });
      const { message, badgesGanhas } = response.data;
      Alert.alert('Sucesso', message);

      if (badgesGanhas.length > 0) {
        setBadgesWon(badgesGanhas);
        setModalVisibleBadge(true);
      }

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

  const filteredMissions = filterMissionStatus ? missions.filter((mission) => mission.situacao === filterMissionStatus) : missions;

  return (
    <View className='flex-1 bg-neutral-900'>
      <View className="flex items-end">
        {loading ? (
          <SkeletonBox height={50} width={50} radius={25} style={{ marginTop: 16, marginRight: 16 }} />
        ) : (
          <TouchableOpacity
            className='mt-4 mr-4 w-12 h-12 rounded-full'
            onPress={handleOpenMissionFilterModal}>
            <Image source={filter} style={{ width: 50, height: 50 }} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        className="mb-28"
        data={loading ? Array(5).fill({}) : filteredMissions}
        keyExtractor={(item, index) => loading ? `skeleton-${index}` : item.id.toString()}
        renderItem={({ item, index }) => (
          loading ? (
            <View className="p-4 border-b border-neutral-700">
              <SkeletonBox height={20} width={'80%'} />
              <SkeletonBox height={20} width={'70%'} />
              <SkeletonBox height={20} width={'60%'} />
              <SkeletonBox height={20} width={'50%'} />
              <SkeletonBox height={20} width={'90%'} style={{ marginBottom: 20 }} />
              
              <SkeletonBox height={20} width={'40%'} />
              <SkeletonBox height={20} width={'60%'} />
              <SkeletonBox height={20} width={'30%'} />
              
              <View className="flex-row justify-between mt-4">
                <View className="flex-row">
                  <SkeletonBox height={30} width={30} radius={15} style={{ marginRight: 16 }} />
                  <SkeletonBox height={30} width={30} radius={15} />
                </View>
                <SkeletonBox height={30} width={30} radius={15} />
              </View>
            </View>
          ) : (
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
                  {item.situacao !== "Finalizada" && item.situacao !== "Não finalizada" && item.iniciado !== true && (
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
          )
        )}
        ListEmptyComponent={
          !loading && filteredMissions.length === 0 ? (
            <View className="p-4 items-center">
              <Text className="text-white">Nenhuma missão encontrada</Text>
            </View>
          ) : null
        }
      />

      {loading ? (
        <SkeletonBox
          height={50}
          width={'90%'}
          radius={25}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
          }}
        />
      ) : (
        <TouchableOpacity
          className='bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5'
          onPress={handleCreateMission}>
          <Text className='text-white text-center font-vt323'>Criar Nova Missão</Text>
        </TouchableOpacity>
      )}

      <MissionFilterModal
        visible={filterModalVisibleMission}
        onClose={() => setFilterModalVisibleMission(false)}
        onFilter={handleMissionFilterSelection}
      />
      <MissionModal
        visible={modalVisibleMission}
        onClose={() => setModalVisibleMission(false)}
        onSave={fetchMissions}
        mission={selectedMission}
        diary={false}
      />
      <ConfirmationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={executeDelete}
        message="Tem certeza que deseja excluir este item?"
      />
      <BadgeModal
        visible={modalVisibleBadge}
        badge={badgesWon}
        onClose={() => setModalVisibleBadge(false)}
      />
    </View>
  );
}