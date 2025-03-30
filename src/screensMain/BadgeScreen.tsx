import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { NavigationProps } from '../navigation/types';
import { getUserId } from '../screensBottom/ProgressScreen';

import rank_f from '../assets/images/badges/rank_f.png';
import rank_e from '../assets/images/badges/rank_e.png';
import rank_d from '../assets/images/badges/rank_d.png';
import rank_c from '../assets/images/badges/rank_c.jpg';
import rank_b from '../assets/images/badges/rank_b.png';
import rank_a from '../assets/images/badges/rank_a.png';
import rank_s from '../assets/images/badges/rank_s.jpg';
import rank_ss from '../assets/images/badges/rank_ss.jpg';
import rank_sss from '../assets/images/badges/rank_sss.png';
import rank_sss_plus from '../assets/images/badges/rank_sss_plus.png';
import iniciante from '../assets/images/badges/inciante.jpg';
import guerreiro_da_rotina from '../assets/images/badges/guerreiro_da_rotina.jpg';
import mestre_da_disciplina from '../assets/images/badges/mestre_da_disciplina.jpg';
import maratonista from '../assets/images/badges/maratonista.jpg';
import imbativel from '../assets/images/badges/imbativel.jpg';
import cacador_de_ouro from '../assets/images/badges/cacador_de_ouro.jpg';
import poder_supremo from '../assets/images/badges/poder_supremo.png';
import estrategista from '../assets/images/badges/estrategista.png';
import lendario from '../assets/images/badges/lendario.jpg';
import BadgeModal from '../modal/BadgeModal';

export const badgeIcons: Record<string, any> = {
  2: rank_e,
  3: rank_d,
  4: rank_c,
  5: rank_b,
  6: rank_a,
  7: rank_s,
  8: rank_ss,
  9: rank_sss,
  10: rank_sss_plus,
  11: iniciante,
  12: guerreiro_da_rotina,
  13: mestre_da_disciplina,
  14: lendario,
  15: maratonista,
  16: imbativel,
  17: cacador_de_ouro,
  18: poder_supremo,
  19: estrategista,
};

export default function BadgeScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error('Usuário não encontrado.');
        
        const response = await axios.get(`${API_URL}/api/badgeapi/${userId}`);
        setBadges(response.data);
      } catch (error) {
        console.error('Erro ao buscar medalhas:', error);
      }
    };
    
    fetchBadges();
  }, []);

  const openBadgeModal = (badge: any) => {
    setSelectedBadge(badge);
    console.log(badge)
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-blue-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4">
          <ArrowLeftIcon size={30} color="black" />
        </TouchableOpacity>
        <Text className="font-vt323 text-white mt-4 ml-4 text-xl">Medalhas</Text>
      </SafeAreaView>
      
      <ScrollView>
        <View className="flex-row flex-wrap justify-center p-4">
          {badges.map((badge, index) => (
            <TouchableOpacity key={index} onPress={() => openBadgeModal(badge)}>
              <Image 
                source={badgeIcons[badge.icone]} 
                className="w-24 h-24 m-2"
                style={{ opacity: badge.conquistado ? 1 : 0.3 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      
      <BadgeModal
        visible={modalVisible}
        badge={selectedBadge}
        onClose={() => setModalVisible(false)}
      />

    </View>
  );
}
