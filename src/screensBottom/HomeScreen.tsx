import React, { useEffect, useState, useRef } from 'react';
import {
  Text, TouchableOpacity, View, Image, ActivityIndicator, ScrollView, Animated, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalComponent from '../modal/moreOptions';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { CopilotProvider, CopilotStep, walkthroughable, useCopilot } from 'react-native-copilot';

import gold_image from '../assets/images/home/gold.png';
import levelUp_image from '../assets/images/home/levelUp_home.png';
import nivel_image from '../assets/images/home/nivel_home.png';
import rank_image from '../assets/images/home/rank_home.png';
import moreOptions_image from '../assets/images/home/more_options.png';
import xp_image from '../assets/images/mission/xp.png';

import { NavigationProps } from '../navigation/types';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';
import { API_URL } from '@env';
import axios from 'axios';

import help_image from '../assets/images/status/help.png';

// Criando componentes "walkthroughable"
const WalkthroughableView = walkthroughable(View);
const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);

function HomeScreenContent() {
  const { userData } = useFetchStatusUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [missionsData, setMissionsData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [pieChartData, setPieChartData] = useState([]);
  const [missionCounts, setMissionCounts] = useState({
    finalizadas: 0,
    emProgresso: 0,
    naoFinalizadas: 0
  });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProps>();
  const { start } = useCopilot();

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

  useEffect(() => {
    animateSkeleton();
  }, []);

  const handleNavigate = (screen: any) => navigation.navigate(screen);

  const formatDate = (dateString: string) => {
    const day = dateString.slice(8, 10);
    const month = dateString.slice(5, 7);
    return `${day}/${month}`;
  };

  const fetchMissionsData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/missionapi/complete/last7days/${userData?.id_usuario}`);
      const rawData = response.data.missionsPerDay;
      const labels = Object.keys(rawData).map(formatDate);
      const data = Object.values(rawData);

      setMissionsData({
        labels,
        datasets: [{ data }],
      });
      console.log(data)
    } catch (err) {
      console.error('Erro ao buscar os dados de missões:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMissionStatusData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/missionapi/status/last7days/${userData?.id_usuario}`);
      const statusCounts = response.data;
      
      setMissionCounts({
        finalizadas: statusCounts.finalizadas.length,
        emProgresso: statusCounts.emProgresso.length,
        naoFinalizadas: statusCounts.naoFinalizadas.length
      });

      const pieData = [
        { 
          name: `Finalizadas`, 
          population: statusCounts.finalizadas.length, 
          color: '#22caec', 
          legendFontColor: '#fff', 
          legendFontSize: 15 
        },
        { 
          name: `Em Progresso`, 
          population: statusCounts.emProgresso.length, 
          color: '#f39c12', 
          legendFontColor: '#fff', 
          legendFontSize: 15 
        },
        { 
          name: `Não Finalizadas`, 
          population: statusCounts.naoFinalizadas.length, 
          color: '#ff6b6b', 
          legendFontColor: '#fff', 
          legendFontSize: 15 
        },
      ];

      setPieChartData(pieData);
    } catch (err) {
      console.error('Erro ao buscar status das missões:', err);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchMissionsData();
      fetchMissionStatusData();
    }
  }, [userData]);

  const SkeletonBox = ({ height, width, radius = 8 }) => (
    <Animated.View
      style={{
        backgroundColor: '#444',
        opacity: skeletonOpacity,
        height,
        width,
        borderRadius: radius,
        marginBottom: 10,
      }}
    />
  );

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <View>
          {loading ? (
            <>
              <SkeletonBox height={20} width={150} />
              <SkeletonBox height={20} width={150} />
              <SkeletonBox height={20} width={180} />
              <SkeletonBox height={20} width={170} />
              <SkeletonBox height={20} width={100} />
            </>
          ) : (
            <>
              <CopilotStep 
                text="Aqui você pode ver seu rank atual no jogo" 
                order={1} 
                name="rank"
              >
                <WalkthroughableView className="flex-row items-center mb-2">
                  <Image source={rank_image} className="w-8 h-7" />
                  <Text className="text-white font-vt323">Rank: {userData?.rank}</Text>
                </WalkthroughableView>
              </CopilotStep>
              
              <CopilotStep 
                text="Este é o seu nível atual no jogo" 
                order={2} 
                name="nivel"
              >
                <WalkthroughableView className="flex-row items-center mb-2">
                  <Image source={nivel_image} className="w-7 h-7 mr-1" />
                  <Text className="text-white font-vt323">Nível: {userData?.nivel}</Text>
                </WalkthroughableView>
              </CopilotStep>
              
              <CopilotStep 
                text="Aqui mostra o XP necessário para alcançar o próximo nível" 
                order={3} 
                name="proximo-nivel"
              >
                <WalkthroughableView className="flex-row items-center mb-2">
                  <Image source={levelUp_image} className="w-7 h-7 mr-1" />
                  <Text className="text-white font-vt323">Próximo Nível: {userData?.proximo_nivel}</Text>
                </WalkthroughableView>
              </CopilotStep>
              
              <CopilotStep 
                text="Este é o total de XP que você acumulou" 
                order={4} 
                name="total-xp"
              >
                <WalkthroughableView className="flex-row items-center mb-2">
                  <Image source={xp_image} className="w-7 h-7 mr-1" />
                  <Text className="text-white font-vt323">Total de xp: {userData?.total_xp}</Text>
                </WalkthroughableView>
              </CopilotStep>
              
              <CopilotStep 
                text="Aqui você vê a quantidade de ouro que possui" 
                order={5} 
                name="ouro"
              >
                <WalkthroughableView className="flex-row items-center">
                  <Image source={gold_image} className="w-7 h-7 mr-1" />
                  <Text className="text-white font-vt323">Ouro: {userData?.ouro}</Text>
                </WalkthroughableView>
              </CopilotStep>
            </>
          )}
        </View>

        <CopilotStep 
          text="Menu de opções com funcionalidades adicionais" 
          order={6} 
          name="more-options"
        >
          <WalkthroughableTouchableOpacity
            className="absolute right-4 top-12"
            onPress={() => setModalVisible(true)}
          >
            <Image source={moreOptions_image} className="w-7 h-7" />
          </WalkthroughableTouchableOpacity>
        </CopilotStep>
      </SafeAreaView>

      <ScrollView>
        <CopilotStep 
          text="Gráfico mostrando suas missões concluídas nos últimos 7 dias" 
          order={7} 
          name="bar-chart"
        >
          <WalkthroughableView>
            <Text className="text-white font-vt323 mt-10 p-2">Missões concluídas nos últimos 7 dias: </Text>
            <View className="p-4">
              {loading ? (
                <SkeletonBox height={300} width={Dimensions.get('window').width - 32} radius={16} />
              ) : missionsData.labels.length > 0 ? (
                <BarChart
                  data={missionsData}
                  yAxisLabel=""
                  yAxisSuffix=""
                  width={Dimensions.get('window').width - 32}
                  height={300}
                  chartConfig={{
                    backgroundGradientFrom: '#22caec',
                    backgroundGradientTo: 'blue',
                    backgroundGradientFromOpacity: 1,
                    backgroundGradientToOpacity: 1,
                    color: () => 'white',
                    barPercentage: 0.8,
                    fillShadowGradient: 'white',
                    fillShadowGradientOpacity: 2,
                    decimalPlaces: 1,
                  }}
                  fromZero
                />
              ) : (
                <Text className="text-white text-center">Nenhum dado disponível para exibição.</Text>
              )}
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep 
          text="Resumo do status das suas missões recentes" 
          order={8} 
          name="mission-status"
        >
          <WalkthroughableView>
            <Text className="text-white font-vt323 mt-10 p-2">Status das Missões nos últimos 7 dias: </Text>
            
            <View className="flex-row justify-around p-2">
              <View className="items-center">
                <Text className="text-cyan-400 font-vt323 text-lg">{missionCounts.finalizadas}</Text>
                <Text className="text-white font-vt323">Finalizadas</Text>
              </View>
              <View className="items-center">
                <Text className="text-yellow-500 font-vt323 text-lg">{missionCounts.emProgresso}</Text>
                <Text className="text-white font-vt323">Em Progresso</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-400 font-vt323 text-lg">{missionCounts.naoFinalizadas}</Text>
                <Text className="text-white font-vt323">Não Finalizadas</Text>
              </View>
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep 
          text="Gráfico de pizza mostrando a distribuição dos status das missões" 
          order={9} 
          name="pie-chart"
        >
          <WalkthroughableView>
            {loading ? (
              <SkeletonBox height={250} width={Dimensions.get('window').width - 32} radius={16} />
            ) : pieChartData.length > 0 ? (
              <PieChart
                data={pieChartData}
                width={Dimensions.get('window').width}
                height={250}
                chartConfig={{
                  backgroundColor: 'transparent',
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                accessor="population"
                backgroundColor="transparent"
              />
            ) : (
              <Text className="text-white text-center">Nenhum dado disponível para exibição.</Text>
            )}
          </WalkthroughableView>
        </CopilotStep>

        <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)} onNavigate={handleNavigate} />
      </ScrollView>
      
      <CopilotStep 
        text="Clique aqui para ver este tutorial novamente" 
        order={10} 
        name="help-button"
      >
        <WalkthroughableTouchableOpacity 
          onPress={() => start()} 
          className="absolute bottom-4 right-4 bg-yellow-500 rounded-full p-2 shadow-lg"
        >
          <Image source={help_image} className="w-10 h-10" />
        </WalkthroughableTouchableOpacity>
      </CopilotStep>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <CopilotProvider 
      overlay="svg" 
      animated={true}
      tooltipStyle={{
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#ffffff', // Fundo branco
      }}
      tooltipTextStyle={{
        color: '#000000', // Texto preto
        fontFamily: 'vt323',
        fontSize: 20,
      }}
      stepNumberComponent={({ currentStepNumber }) => (
        <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center mr-2">
          <Text className="text-white font-bold">{currentStepNumber}</Text>
        </View>
      )}
      labels={{
        skip: <Text className="text-blue-500">Pular</Text>,
        previous: <Text className="text-blue-500">Anterior</Text>,
        next: <Text className="text-blue-500">Próximo</Text>,
        finish: <Text className="text-blue-500">Finalizar</Text>,
      }}
    >
      <HomeScreenContent />
    </CopilotProvider>
  );
}