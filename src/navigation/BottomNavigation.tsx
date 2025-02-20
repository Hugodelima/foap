import React, { useEffect } from 'react';
import { BackHandler, Alert, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screensBottom/HomeScreen';
import MissionScreen from '../screensBottom/ProgressScreen'
import ReportScreen from '../screensBottom/ReportScreen';
import LeaderboardScreen from '../screensBottom/LeaderboardScreen';

import {useBackButtonHandler} from '../hooks/useBackButtonHandler'
import { Header } from 'react-native/Libraries/NewAppScreen';

import menu_imagem from '../assets/images/tabscreen/menu.png'
import missao_imagem from '../assets/images/tabscreen/missoes.png'
import classificacao_imagem from '../assets/images/tabscreen/classificacao.png'
import relatorio_imagem from '../assets/images/tabscreen/relatorio.png'

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  
  useBackButtonHandler();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#262626', 
        },
        tabBarActiveTintColor: 'white', 
        tabBarInactiveTintColor: 'gray',
      }}
    >                                                                       
      <Tab.Screen name="Início" options={{ headerShown: false, tabBarIcon:({color, size})=> <Image source={menu_imagem} style={{ width: size, height: size, tintColor: color }}/>}} component={HomeScreen} />
      <Tab.Screen name="Progresso" options={{ headerShown: false, tabBarIcon:({color, size})=> <Image source={missao_imagem} style={{ width: 16, height: 20, tintColor: color }}/>}} component={MissionScreen} />
      <Tab.Screen name="Relatório" options={{ headerShown: false , tabBarIcon:({color, size})=> <Image source={relatorio_imagem} style={{ width: size, height: size, tintColor: color }}/>}} component={ReportScreen} />
      <Tab.Screen name="Classificação" options={{ headerShown: false , tabBarIcon:({color, size})=> <Image source={classificacao_imagem} style={{ width: 18, height: 20, tintColor: color }}/>}} component={LeaderboardScreen} />
    </Tab.Navigator>
  );
}
