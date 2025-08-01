import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

import edit_image from '../assets/images/status/edit.png';
import up_image from '../assets/images/status/up.png';
import bottom_image from '../assets/images/status/bottom.png';
import help_image from '../assets/images/status/help.png';

import axios from 'axios';
import { API_URL } from '@env';
import { NavigationProps } from '../navigation/types';
import { getUserId } from '../screensBottom/ProgressScreen';

import { Alert } from 'react-native';

export default function AttributesScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [selectedSection, setSelectedSection] = useState<string>('mental');
  const [showArrows, setShowArrows] = useState<boolean>(false);
  const [attributes, setAttributes] = useState<any>(null);
  const [availablePoints, setAvailablePoints] = useState<number>(0);

  useEffect(() => {
    const fetchAttributesAndStatus = async () => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error('Usuário não encontrado.');
  
        // Buscar os atributos
        const attributesResponse = await axios.get(`${API_URL}/api/attributeapi/${userId}`);
  
        const attributesData = attributesResponse.data;
        const mental = attributesData.filter((attr: any) => attr.tipo === 'Mental');
        const fisico = attributesData.filter((attr: any) => attr.tipo === 'Físico');
        setAttributes({ mental, fisico });

        const statusResponse = await axios.get(`${API_URL}/api/statusapi/${userId}`);
        const { pd } = statusResponse.data[0];
        setAvailablePoints(pd || 0);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };
  
    fetchAttributesAndStatus();
  }, []);

  const updateAttribute = async (attributeId: number, operation: 'increment' | 'decrement') => {
    try {
      const userId = await getUserId();
  
      if (operation === 'increment' && availablePoints <= 0) {
        Alert.alert(
          "Aviso",
          "Você não tem pontos disponíveis!",  // Mensagem principal
          [
            { text: "OK" }
          ]
        );
        return;
      }
  
      const currentAttribute = [...attributes.mental, ...attributes.fisico].find(
        (attr: any) => attr.id === attributeId
      );
  
      if (operation === 'decrement' && currentAttribute.valor <= 0) {
        Alert.alert(
          "Aviso",
          "O atributo já está no valor mínimo!",  // Mensagem principal
          [
            { text: "OK" }
          ]
        );
        return;
      }
  
      // Atualiza o atributo no backend
      await axios.put(`${API_URL}/api/attributeapi/${userId}`, {
        attributeId,
        operation,
      });
  
      // Busca os atributos e pontos disponíveis atualizados
      const statusResponse = await axios.get(`${API_URL}/api/statusapi/${userId}`);
      const { pd } = statusResponse.data[0];
      setAvailablePoints(pd || 0);
  
      const attributesResponse = await axios.get(`${API_URL}/api/attributeapi/${userId}`);
      const attributesData = attributesResponse.data;
      const mental = attributesData.filter((attr: any) => attr.tipo === 'Mental');
      const fisico = attributesData.filter((attr: any) => attr.tipo === 'Físico');
      setAttributes({ mental, fisico });
  
    } catch (error) {
      console.error('Erro ao atualizar atributo:', error);
      Alert.alert(
        "Aviso",
        "Erro ao atualizar atributo.",  // Mensagem principal
        [
          { text: "OK" }
        ]
      );
    }
  };
  
  

  const toggleArrows = () => {
    setShowArrows(!showArrows);
  };

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4 justify-between">
        <View className="flex-row">
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-blue-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4">
            <ArrowLeftIcon size={30} color="black" />
          </TouchableOpacity>
          <Text className="font-vt323 text-white mt-4 ml-4 text-xl">Atributos</Text>
        </View>
        <View>
          <TouchableOpacity onPress={() => navigation.navigate('HelpStatusScreen')} className="p-2 mt-4">
            <Image source={help_image} className="w-10 h-10" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View className="flex-row gap-4 m-4">
        <TouchableOpacity onPress={() => setSelectedSection('mental')}>
          <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'mental' ? 'bg-blue-700' : 'bg-transparent'}`}>
            Mental
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedSection('fisico')}>
          <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'fisico' ? 'bg-blue-700' : 'bg-transparent'}`}>
            Físico
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">      
        {attributes && selectedSection === 'mental' && Array.isArray(attributes.mental) && (
          <View className="flex-row flex-wrap ml-7 mr-3 justify-between">
            {attributes.mental.map((attribute: any, index: number) => (
              <View key={index} className="flex-row items-center mb-4">
                <Image source={{ uri: attribute.icone }} className="w-10 h-10" />
                <Text className="text-white font-vt323 ml-2">
                  {attribute.nome}: {attribute.valor}
                </Text>
                {showArrows && (
                  <View className="flex-row gap-1 ml-1">
                    <TouchableOpacity onPress={() => updateAttribute(attribute.id, 'increment')}>
                      <Image source={up_image} className="w-8 h-8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateAttribute(attribute.id, 'decrement')}>
                      <Image source={bottom_image} className="w-8 h-8" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {attributes && selectedSection === 'fisico' && Array.isArray(attributes.fisico) && (
          <View className="flex-row flex-wrap ml-7 mr-3 justify-between">
            {attributes.fisico.map((attribute: any, index: number) => (
              <View key={index} className="flex-row items-center mb-4">
                <Image source={{ uri: attribute.icone }} className="w-10 h-10" />
                <Text className="text-white font-vt323 ml-2">
                  {attribute.nome}: {attribute.valor}
                </Text>
                {showArrows && (
                  <View className="flex-row gap-1 ml-1">
                    <TouchableOpacity onPress={() => updateAttribute(attribute.id, 'increment')}>
                      <Image source={up_image} className="w-8 h-8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => updateAttribute(attribute.id, 'decrement')}>
                      <Image source={bottom_image} className="w-8 h-8" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
      <View className="flex-row items-center justify-between m-4">
        <Text className="text-white font-vt323">Pontos Disponíveis: {availablePoints}</Text>
        <TouchableOpacity onPress={toggleArrows}>
          <Image source={edit_image} className="w-10 h-10" />
        </TouchableOpacity>
      </View>
    </View>
  ); 
}
