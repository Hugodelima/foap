import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalComponent from '../modal/moreOptions';
import { BarChart } from 'react-native-chart-kit';
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
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProps>();

  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  // Formata a data no formato dd/mm
  // Formata a data no formato dd/mm
  const formatDate = (dateString: string) => {
    
    const day = dateString.slice(8,10)
    const month = dateString.slice(5,7)
    return `${day}/${month}`;
  };

  // Busca os dados da API
  const fetchMissionsData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/missionapi/complete/last7days/${userData?.id}`);

      // Usa apenas as chaves do objeto retornado para definir as labels
      const rawData = response.data.missionsPerDay;
      const labels = Object.keys(rawData).map(formatDate); // Formata as datas no formato dd/mm
      const data = Object.values(rawData); // Obtém os valores correspondentes
      console.log(data)
   

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


  useEffect(() => {
    if (userData?.id) {
      fetchMissionsData();
    }
  }, [userData]);

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <Image 
          source={{ uri: 'https://static-00.iconduck.com/assets.00/user-icon-1024x1024-dtzturco.png' }} 
          className="w-12 h-12 mr-3"
        />
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
          <Image 
            source={moreOptions_image} 
            className="w-7 h-7"
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Gráfico de Barras */}
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
              decimalPlaces: 1
            }}
            
            fromZero // Garante que o gráfico começa do zero
            
          />
        ) : (
          <Text className="text-white text-center">Nenhum dado disponível para exibição.</Text>
        )}
      </View>

      <ModalComponent visible={modalVisible} onClose={() => setModalVisible(false)} onNavigate={handleNavigate} />
    </View>
  );
}
