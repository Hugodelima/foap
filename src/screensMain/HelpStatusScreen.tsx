import React, { useState } from 'react';
import { Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';

export default function HelpStatusScreen() {
  const navigation = useNavigation();
  const [selectedSection, setSelectedSection] = useState<string>('mental');

  const mentalAttributes = [
    { key: 'INT', label: 'Inteligência (INT)', description: 'Capacidade de aprender, resolver problemas e aplicar conhecimentos adquiridos de forma eficaz.' },
    { key: 'CRE', label: 'Criatividade (CRE)', description: 'Habilidade de pensar de maneira inovadora e gerar novas ideias ou soluções.' },
    { key: 'DIS', label: 'Disciplina (DIS)', description: 'Capacidade de seguir rotinas, manter hábitos saudáveis e cumprir metas estabelecidas.' },
    { key: 'CON', label: 'Confiança (CON)', description: 'Nível de autoconfiança e segurança ao enfrentar desafios e tomar decisões.' },
    { key: 'CAR', label: 'Carisma (CAR)', description: 'Habilidade de se conectar com os outros, influenciar e liderar de forma eficaz.' },
    { key: 'EMP', label: 'Empatia (EMP)', description: 'Habilidade de compreender e compartilhar os sentimentos dos outros, promovendo relações saudáveis e colaborativas.' },
    { key: 'COM', label: 'Comunicação (COM)', description: 'Eficácia em expressar ideias, ouvir os outros e manter um diálogo claro e construtivo.' }
  ];

  const physicalAttributes = [
    { key: 'AGI', label: 'Agilidade (AGI)', description: 'Capacidade de se mover rapidamente e com facilidade.' },
    { key: 'END', label: 'Endurance (END)', description: 'Capacidade de sustentar atividade física por longos períodos.' },
    { key: 'FLE', label: 'Flexibilidade (FLE)', description: 'Capacidade de mover as articulações e músculos através de toda a amplitude de movimento.' },
    { key: 'BAL', label: 'Equilíbrio (BAL)', description: 'Habilidade de manter a estabilidade e o controle do corpo em várias posições.' },
    { key: 'COO', label: 'Coordenação (COO)', description: 'Capacidade de usar diferentes partes do corpo juntas de maneira eficiente e eficaz.' },
    { key: 'REA', label: 'Reação (REA)', description: 'Velocidade com que se responde a estímulos.' },
    { key: 'VEL', label: 'Velocidade (VEL)', description: 'Capacidade de se mover rapidamente.' }
  ];

  const renderAttribute = (item: { key: string; label: string; description: string }) => (
    <View className="m-2">
      <Text className="text-white font-vt323 text-lg">{item.label}</Text>
      <Text className="text-white font-vt323 mt-1">{item.description}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral-900">
      <SafeAreaView className="bg-neutral-800 rounded-b-lg border-b-8 border-cyan-500 flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4">
          <ArrowLeftIcon size="30" color="black" />
        </TouchableOpacity>
        <Text className="font-vt323 text-white mt-4 ml-4 text-xl">Atributos</Text>
      </SafeAreaView>

      <View className="flex-row gap-4 m-4">
        <TouchableOpacity onPress={() => setSelectedSection('mental')}>
          <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'mental' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
            Mental
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedSection('fisico')}>
          <Text className={`text-white font-vt323 p-3 rounded-2xl ${selectedSection === 'fisico' ? 'bg-fuchsia-700' : 'bg-transparent'}`}>
            Físico
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={selectedSection === 'mental' ? mentalAttributes : physicalAttributes}
        renderItem={({ item }) => renderAttribute(item)}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}
