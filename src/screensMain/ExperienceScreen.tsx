import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';

import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

import levelUp_image from '../assets/images/home/levelUp_home.png';
import xp_image from '../assets/images/mission/xp.png';
import xpFaltante_image from '../assets/images/experience/xp_without.png';

import { useFetchStatusUser } from '../hooks/useFetchDataStatus';
import axios from 'axios';
import { API_URL } from '@env';
import { getUserId } from '../screensBottom/ProgressScreen';

const screenWidth = Dimensions.get('window').width;

export default function ExperienceScreen() {
  const navigation = useNavigation();
  const { userData, error } = useFetchStatusUser();

  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(false);

  const fetchLast7DaysXP = async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/missionapi/xp/last7days/${userId}`);
      console.log(response.data); // Verifique a estrutura da resposta aqui
  
      const data = response.data.data;
      if (!data || data.length === 0) {
        console.log("Nenhum dado encontrado para o período.");
        return; // Ou exiba uma mensagem adequada para o usuário
      }
  
      // Preparar os dados para o gráfico
      const labels = data.labels; // O backend já retorna as labels formatadas
      const datasets = [{ data: data.datasets[0].data }];
      console.log(datasets)
      setChartData({ labels, datasets });
    } catch (error) {
      console.error('Erro ao buscar dados de XP diário:', error);
    }
    setLoading(false);
  };
  
  
  

  useEffect(() => {
    fetchLast7DaysXP();
  }, []);

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-blue-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4">
          <ArrowLeftIcon size={30} color="black" />
        </TouchableOpacity>
        <Text className="font-vt323 text-white mt-4 ml-4 text-xl">Experiência</Text>
      </SafeAreaView>

      <View className="items-center m-4">
      
        <View className="flex-row items-center mb-2">
          <Image source={levelUp_image} className="w-7 h-7 mr-1" />
          <Text className="text-white font-vt323">Próximo Nível: {userData?.proximo_nivel}</Text>
        </View>
        <View className="flex-row items-center">
          <Image source={xpFaltante_image} style={{ width: 30, height: 30, marginRight: 5 }} />
          <Text className="text-white font-vt323">XP para subir de nível: {userData?.xp_faltante}</Text>
        </View>
        <View className="flex-row items-center">
          <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5 }} />
          <Text className="text-white font-vt323">Total de XP: {userData?.total_xp}</Text>
        </View>
      </View>

      {/* Gráfico de Barras */}
      <Text className="text-white font-vt323 mt-10 p-2">Xp ganho nos últimos 7 dias: </Text>
      <View className="m-4">
        {loading ? (
          <ActivityIndicator size="large" color="#00ff00" />
        ) : chartData.labels.length > 0 ? (
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
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
            style={{
              borderRadius: 16,
              marginVertical: 8,
            }}
          />
        ) : (
          <Text className="text-white text-center">Nenhum dado disponível para os últimos 7 dias.</Text>
        )}
      </View>
    </View>
  );
}
