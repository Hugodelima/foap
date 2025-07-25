import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';
import ModalComponent from '../modal/moreOptions';
import MissionSection from './MissionSection'
import PenaltySection from './PenaltySection'
import RewardSection from './RewardSection'
import gold_image from '../assets/images/home/gold.png';
import xp_image from '../assets/images/mission/xp.png';
import moreOptions_image from '../assets/images/home/more_options.png';
import * as SecureStore from 'expo-secure-store';
import { NavigationProps } from '../navigation/types';
import MissionDiarySection from './MissionDiarySection';

export async function getUserId() {
  const userID = await SecureStore.getItemAsync('userStorageID');
  return userID;
}

export default function MissionScreen() {
  const [modalVisibleOption, setModalVisibleOption] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('missao');
  const { userData, setUserData } = useFetchStatusUser();
  const navigation = useNavigation<NavigationProps>();
  
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

  const SkeletonBox = ({ width, height = 20, radius = 4, style = {} }) => (
    <Animated.View
      style={{
        backgroundColor: '#444',
        opacity: skeletonOpacity,
        width,
        height,
        borderRadius: radius,
        marginLeft: 5,
        ...style,
      }}
    />
  );

  useEffect(() => {
    animateSkeleton();
  }, []);

  const handleNavigate = (screen: any) => {
    navigation.navigate(screen);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <SafeAreaView className='bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500'>
        <View className='flex-row items-center mb-4'>
          <View className='flex-row items-center'>
            <Image source={gold_image} style={{ width: 30, height: 30, marginRight: 5 }} />
            {userData?.ouro === null || userData?.ouro === undefined ? (
              <SkeletonBox width={60} />
            ) : (
              <Text className='text-white font-vt323'>{userData?.ouro}</Text>
            )}
          </View>
          <View className='flex-row items-center ml-4'>
            <Image source={xp_image} style={{ width: 30, height: 30, marginRight: 5 }} />
            {userData?.total_xp === null || userData?.total_xp === undefined ? (
              <SkeletonBox width={60} />
            ) : (
              <Text className='text-white font-vt323'>{userData?.total_xp}</Text>
            )}
          </View>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-4 mb-4 mt-1">
            <TouchableOpacity onPress={() => setSelectedSection('missao')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'missao' ? 'bg-blue-700' : 'bg-transparent'}`}>
                Missões
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSection('missao_diarias')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'missao_diarias' ? 'bg-blue-700' : 'bg-transparent'}`}>
                Missões Diárias
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSection('penalidade')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'penalidade' ? 'bg-blue-700' : 'bg-transparent'}`}>
                Penalidades
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedSection('recompensa')}>
              <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'recompensa' ? 'bg-blue-700' : 'bg-transparent'}`}>
                Recompensas
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <TouchableOpacity className="absolute right-4 top-12" onPress={() => setModalVisibleOption(true)}>
        <Image source={moreOptions_image} className="w-7 h-7" />
      </TouchableOpacity>

      <View className='flex-1'>
        {selectedSection === 'missao' && <MissionSection />}
        {selectedSection === 'missao_diarias' && <MissionDiarySection />}
        {selectedSection === 'penalidade' && <PenaltySection />}
        {selectedSection === 'recompensa' && <RewardSection />}
      </View>
      <ModalComponent visible={modalVisibleOption} onClose={() => setModalVisibleOption(false)} onNavigate={handleNavigate} />
    </View>
  );
}