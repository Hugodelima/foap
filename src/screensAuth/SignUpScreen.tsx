import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';
import signup_image from '../assets/images/signup/Sign_Up.png'

import rank_f from '../assets/images/badges/rank_f.png';
import rank_e from '../assets/images/badges/rank_e.png';
import rank_d from '../assets/images/badges/rank_d.png';
import rank_c from '../assets/images/badges/rank_c.png';
import rank_b from '../assets/images/badges/rank_b.png';
import rank_a from '../assets/images/badges/rank_a.png';
import rank_s from '../assets/images/badges/rank_s.png';
import rank_ss from '../assets/images/badges/rank_ss.png';
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
import lendario from '../assets/images/badges/lendario.png';

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useBackButtonHandler()

  const isValidEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };
  const crateAttributeAndBadges = async (userID) => {
    const atributos = [
      { nome: 'Inteligência', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1945/1945713.png' },
      { nome: 'Criatividade', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1497/1497726.png' },
      { nome: 'Disciplina', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/4729/4729468.png' },
      { nome: 'Confiança', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5828/5828162.png' },
      { nome: 'Carisma', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/8420/8420287.png' },
      { nome: 'Empatia', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5894/5894104.png' },
      { nome: 'Comunicação', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5864/5864217.png' },
      { nome: 'Agilidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1388/1388519.png' },
      { nome: 'Resistência', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/15888/15888479.png' },
      { nome: 'Flexibilidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/2373/2373008.png' },
      { nome: 'Equilíbrio', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/2043/2043960.png' },
      { nome: 'Força', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/3476/3476001.png' },
      { nome: 'Reação', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/764/764221.png' },
      { nome: 'Velocidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/6534/6534475.png' },
    ];
  
    const badges = [
      { titulo: "Rank E", descricao: "Alcançou o rank E", conquistado: false, icone: '2' },
      { titulo: "Rank D", descricao: "Alcançou o rank D", conquistado: false, icone: '3' },
      { titulo: "Rank C", descricao: "Alcançou o rank C", conquistado: false, icone: '4' },
      { titulo: "Rank B", descricao: "Alcançou o rank B", conquistado: false, icone: '5' },
      { titulo: "Rank A", descricao: "Alcançou o rank A", conquistado: false, icone: '6' },
      { titulo: "Rank S", descricao: "Alcançou o rank S", conquistado: false, icone: '7' },
      { titulo: "Rank SS", descricao: "Alcançou o rank SS", conquistado: false, icone: '8' },
      { titulo: "Rank SSS", descricao: "Alcançou o rank SSS", conquistado: false, icone: '9' },
      { titulo: "Rank SSS+", descricao: "Alcançou o rank SSS+", conquistado: false, icone: '10' },
      { titulo: "Iniciante", descricao: "Primeira missão concluída com sucesso.", conquistado: false, icone: '11' },
      { titulo: "Guerreiro da Rotina", descricao: "Completou 10 missões.", conquistado: false, icone: '12' },
      { titulo: "Mestre da Disciplina", descricao: "Completou 50 missões.", conquistado: false, icone: '13' },
      { titulo: "Lendário", descricao: "Completou 100 missões.", conquistado: false, icone: '14' },
      { titulo: "Maratonista", descricao: "Realizou uma missão diária por 7 dias seguidos.", conquistado: false, icone: '15' },
      { titulo: "Imbatível", descricao: "Completou uma missão absurda.", conquistado: false, icone: '16' },
      { titulo: "Caçador de Ouro", descricao: "Acumulou 10.000 de ouro.", conquistado: false, icone: '17' },
      { titulo: "Poder Supremo", descricao: "Acumulou 100 pontos de disponíveis.", conquistado: false, icone: '18' },
      { titulo: "Estrategista", descricao: "Acumulou 10.000 de XP", conquistado: false, icone: '19' },
    ];
  
    try {
      // Criar atributos e badges simultaneamente
      await Promise.all([
        Promise.all(atributos.map(atributo =>
          axios.post(`${API_URL}/api/attributeapi/create`, { ...atributo, id_usuario: userID })
        )),
        Promise.all(badges.map(badge =>
          axios.post(`${API_URL}/api/badgeapi/create`, { ...badge, id_usuario: userID })
        ))
      ]);
  
      console.log('Atributos e badges criados com sucesso.');
    } catch (error) {
      console.error('Erro ao criar atributos ou badges:', error);
      Alert.alert('Erro', 'Falha ao criar atributos ou badges.');
    }
  };
  
  const handleRegister = async () => {
    if (username.length === 0 || email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      Alert.alert("Erro", "Preencha todos os campos corretamente");
      return;
    } else if (!isValidEmail(email)) {
      Alert.alert("Erro", "O e-mail fornecido não é válido.");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }
  
    try {
      // Registro do usuário
      console.log(API_URL)
      const response = await axios.post(`${API_URL}/api/userapi/register`, {
        nome_usuario: username,
        email,
        senha: password,
      });
  
      if (response.status === 200) {
        const { userID } = response.data;
  
        console.log('signup id: ' + userID);
  
        // Criar código de verificação com nova rota
        try {
          await axios.post(`${API_URL}/api/verificationapi/generate/${userID}`);
          console.log('Código de verificação gerado com sucesso.');
        } catch (verificationError) {
          console.error('Erro ao gerar código de verificação:', verificationError);
          Alert.alert('Erro', 'Falha ao gerar código de verificação.');
          return;
        }
        // cria as fases
        try {
          const statusResponse = await axios.post(`${API_URL}/api/statusapi/create/${userID}`);
          console.log('Status criado com sucesso:', statusResponse.data);
        } catch (statusError) {
          console.error('Erro ao criar status:', statusError);
          Alert.alert('Erro', 'Falha ao criar status.');
        }
  
        crateAttributeAndBadges(userID);

        await SecureStore.setItemAsync('userStorageID', JSON.stringify(userID)); // Salvar ID do usuario
        await AsyncStorage.setItem('emailVerificationStatus', 'true'); // Marca a verificação como pendente
        await AsyncStorage.setItem('emailVerificationData', JSON.stringify({ email, userID })); // Salva email e userID
  
        Alert.alert('Sucesso', 'Registrado com sucesso! Verifique seu e-mail para o código de verificação.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'VerificationScreen', params: { email, userID, verificationType: 'signup' } }],
        });
        

  
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Erro', 'Erro ao registrar, tente novamente.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro durante o cadastro, tente novamente.';
      Alert.alert('Erro', errorMessage);
      console.error(error);
    }
  };
  
  
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex-1 bg-gray-500'>
          <SafeAreaView className='flex'>
            <View className='flex-row justify-center'>
              <Image source={signup_image}
                style={{ width: 200, height: 200 }}
              />
            </View>
          </SafeAreaView>

          <View className='flex-1 bg-white px-8 pt-8'
            style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
          >
            <View className='form space-y-2'>
              <Text className='text-gray-700 ml-4'>Nome de Usuário:</Text>
              <TextInput
                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
                placeholder="Entre com nome do seu usuário"
                value={username}
                onChangeText={setUsername}
              />

              <Text className='text-gray-700 ml-4'>E-mail:</Text>
              <TextInput
                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
                value={email}
                onChangeText={setEmail}
                placeholder="Entre com e-mail aqui"
                keyboardType="email-address"
              />
              <Text className='text-gray-700 ml-4'>Senha:</Text>
              <TextInput
                className='p-4 bg-gray-100 text-gray-700 rounded-2xl'
                value={password}
                onChangeText={setPassword}
                placeholder="Entre com a senha aqui"
                secureTextEntry
              />
              <Text className='text-gray-700 ml-4'>Repetir Senha:</Text>
              <TextInput
                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-4'
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Entre com a senha aqui"
                secureTextEntry
              />

              <TouchableOpacity
                className='py-3 bg-blue-500 rounded-xl'
                onPress={handleRegister}
              >
                <Text className='font-bold text-center text-white'>
                  Cadastrar
                </Text>
              </TouchableOpacity>
            </View>

            <View className='flex-row justify-center mb-10 mt-4'>
              <Text className='text-gray-500 font-semibold'>Já tem uma Conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className='font-bold text-blue-500'>Entrar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}