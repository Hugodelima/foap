import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import { getUserId } from './ProgressScreen';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const userId = await getUserId();

        const response = await axios.get(`${API_URL}/api/statusapi/leaderboard/${userId}`);

        if (response.data) {
          setUserStatus(response.data.userStatus);
          setLeaderboard(response.data.leaderboard);
        }
      } catch (error) {
        console.error('Erro ao buscar leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <SafeAreaView className="mt-4">
        {userStatus && (
          <>
            <Text className="font-vt323 text-center text-white text-4xl">
              Classificação do Rank: {userStatus.rank}
            </Text>
            <Text className="font-vt323 text-white text-center text-sm">
              Para avançar para o próximo rank{' '}
              <Text className="font-vt323 text-white">
                ({userStatus.nextRank || 'Nível Máximo'})
              </Text>
              , você precisa subir mais{' '}
              <Text className="font-vt323 text-white">{userStatus.levelsToNextRank}</Text>{' '}
              <Text className="font-vt323 text-white">
                {userStatus.levelsToNextRank === 1 ? 'nível' : 'níveis'}
              </Text>
              .
            </Text>

            <Text className="font-vt323 text-center text-white text-2xl mt-4">Top 5</Text>

            <View className="gap-4 m-2">
              {leaderboard.map((user, index) => (
                <View key={user.nome_usuario || index} className="flex-row justify-between">
                  <Text className="font-vt323 text-white">{index + 1}°</Text>
                  <Text className="font-vt323 text-white">{user.nome_usuario}</Text>
                  <Text className="font-vt323 text-white">Nível {user.nivel}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}
