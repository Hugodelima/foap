import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screensApp/HomeScreen';
import ConfigScreen from '../screensApp/ConfigScreen';
import ReportScreen from '../screensApp/ReportScreen';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Sair", "Você deseja sair do aplicativo?", [
        {
          text: "Cancelar",
          onPress: () => null,
          style: "cancel"
        },
        { 
          text: "Sim", 
          onPress: () => BackHandler.exitApp() 
        }
      ]);
      return true; // Isso previne o comportamento padrão de voltar
    };
    // Adiciona o listener ao evento de voltar
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    // Remove o listener quando o componente for desmontado, evitando vazamentos de memória
    return () => backHandler.remove();
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="ConfigScreen" component={ConfigScreen} />
      <Tab.Screen name="ReportScreen" component={ReportScreen} />
    </Tab.Navigator>
  );
}
