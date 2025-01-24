import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalComponent from '../modal/moreOptions';
import { BarChart, PieChart } from 'react-native-chart-kit'; // Importando o PieChart
import { Dimensions } from 'react-native';

import gold_image from '../assets/images/home/gold.png';
import levelUp_image from '../assets/images/home/levelUp_home.png';
import nivel_image from '../assets/images/home/nivel_home.png';
import rank_image from '../assets/images/home/rank_home.png';
import moreOptions_image from '../assets/images/home/more_options.png';

import { NavigationProps } from '../navigation/types';
import { useFetchUserData } from '../hooks/useFetchDataUser';
import { API_URL } from '@env';
import axios from 'axios';

export default function HomeScreen() {
  const { userData } = useFetchUserData();
  const [modalVisible, setModalVisible] = useState(false);
  const [missionsData, setMissionsData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [pieChartData, setPieChartData] = useState([]); // Estado para armazenar os dados do gráfico de pizza
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProps>();

  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  // Função para obter o ID do usuário
  const getUserId = async () => {
    // Aqui você vai colocar a lógica de como obter o ID do usuário, exemplo:
    return userData?.id; // Supondo que userData tenha o ID do usuário
  };

  // Formata a data no formato dd/mm
  const formatDate = (dateString: string) => {
    const day = dateString.slice(8, 10);
    const month = dateString.slice(5, 7);
    return `${day}/${month}`;
  };

  // Busca os dados da API para o gráfico de barras
  const fetchMissionsData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/missionapi/complete/last7days/${userData?.id}`);

      // Usa apenas as chaves do objeto retornado para definir as labels
      const rawData = response.data.missionsPerDay;
      const labels = Object.keys(rawData).map(formatDate); // Formata as datas no formato dd/mm
      const data = Object.values(rawData); // Obtém os valores correspondentes

      setMissionsData({
        labels, // Labels formatadas
        datasets: [
          {
            data, // Dados correspondentes
          },
        ],
      });
    } catch (err) {
      console.error('Erro ao buscar os dados de missões:', err);
    } finally {
      setLoading(false);
    }
  };

  // Busca os dados de missões com o status (Finalizada, Em Progresso, Não Finalizada) para o gráfico de pizza
  const fetchMissionStatusData = async () => {
    const userId = await getUserId();
    try {
      const response = await axios.get(`${API_URL}/api/missionapi/status/last7days/${userId}`);
      
      // Organiza os dados para o gráfico de pizza
      const statusCounts = response.data;
      const pieData = [
        {
          name: 'Finalizadas',
          population: statusCounts.finalizadas.length,
          color: '#22caec',
          legendFontColor: '#fff',
          legendFontSize: 15,
        },
        {
          name: 'Em Progresso',
          population: statusCounts.emProgresso.length,
          color: '#ff6b6b',
          legendFontColor: '#fff',
          legendFontSize: 15,
        },
        {
          name: 'Não Finalizadas',
          population: statusCounts.naoFinalizadas.length,
          color: '#f39c12',
          legendFontColor: '#fff',
          legendFontSize: 15,
        },
      ];
      
      setPieChartData(pieData); // Atualiza o estado com os dados do gráfico de pizza
    } catch (err) {
      console.error('Erro ao buscar status das missões:', err);
    }
  };

  useEffect(() => {
    if (userData?.id) {
      fetchMissionsData();
      fetchMissionStatusData(); // Chama a função para buscar os dados de status
    }
  }, [userData]);

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <View>
          <View className="flex-row items-center mb-2">
            <Image source={rank_image} className="w-8 h-7" />
            <Text className="text-white font-vt323">Rank: {userData?.rank}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={nivel_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Nível: {userData?.nivel}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={levelUp_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Próximo Nível: {userData?.proximo_nivel}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={levelUp_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Total de xp: {userData?.total_xp}</Text>
          </View>
          <View className="flex-row items-center">
            <Image source={gold_image} className="w-7 h-7 mr-1" />
            <Text className="text-white font-vt323">Ouro: {userData?.ouro}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="absolute right-4 top-12"
          onPress={() => setModalVisible(true)}
        >
          <Image source={moreOptions_image} className="w-7 h-7" />
        </TouchableOpacity>
      </SafeAreaView>
      <ScrollView>

        {/* Gráfico de Barras */}
        <Text className="text-white font-vt323 mt-10 p-2">Missões concluídas nos últimos 7 dias: </Text>
        <View className="p-4">
          {loading ? (
            <ActivityIndicator size="large" color="#22caec" />
          ) : missionsData.labels.length > 0 ? (
            <BarChart
              data={missionsData}
              yAxisLabel=""
              yAxisSuffix=""
              width={Dimensions.get('window').width - 32}
              height={300}
              chartConfig={{
                backgroundGradientFrom: '#22caec',
                backgroundGradientFromOpacity: 1,
                backgroundGradientTo: 'blue',
                backgroundGradientToOpacity: 1,
                color: () => 'white',
                barPercentage: 0.8,
                fillShadowGradient: 'white',
                fillShadowGradientOpacity: 2,
                decimalPlaces: 1,
              }}
              fromZero // Garante que o gráfico começa do zero
            />
          ) : (
            <Text className="text-white text-center">Nenhum dado disponível para exibição.</Text>
          )}
        </View>

        {/* Gráfico de Pizza */}
        <Text className="text-white font-vt323 mt-10 p-2">Missões nos últimos 7 dias: </Text>
        <View className="">
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={Dimensions.get('window').width}
              height={250}
              chartConfig={{
                backgroundColor: 'transparent',
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
            />
          ) : (
            <ActivityIndicator size="large" color="#22caec" />
          )}
        </View>

        <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)} onNavigate={handleNavigate} />
      </ScrollView>
    </View>
  );
}
