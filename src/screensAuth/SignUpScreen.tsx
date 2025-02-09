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
        const atributos = [
          // Atributos mentais
          { nome: 'Inteligência', tipo: 'Mental', valor: 0 },
          { nome: 'Criatividade', tipo: 'Mental', valor: 0 },
          { nome: 'Disciplina', tipo: 'Mental', valor: 0 },
          { nome: 'Confiança', tipo: 'Mental', valor: 0 },
          { nome: 'Carisma', tipo: 'Mental', valor: 0 },
          { nome: 'Empatia', tipo: 'Mental', valor: 0 },
          { nome: 'Comunicação', tipo: 'Mental', valor: 0 },
          // Atributos físicos
          { nome: 'Agilidade', tipo: 'Físico', valor: 0 },
          { nome: 'Resistência', tipo: 'Físico', valor: 0 },
          { nome: 'Flexibilidade', tipo: 'Físico', valor: 0 },
          { nome: 'Equilíbrio', tipo: 'Físico', valor: 0 },
          { nome: 'Coordenação', tipo: 'Físico', valor: 0 },
          { nome: 'Reação', tipo: 'Físico', valor: 0 },
          { nome: 'Velocidade', tipo: 'Físico', valor: 0 },
        ];
        try {
          for (const atributo of atributos) {
            await axios.post(`${API_URL}/api/attributeapi/create`, {
              ...atributo,
              id_usuario: userID,
            });
          }
          console.log('Atributos criados com sucesso.');
        } catch (attributeError) {
          console.error('Erro ao criar atributos:', attributeError);
          Alert.alert('Erro', 'Falha ao criar atributos.');
          return;
        }
  
        
        await SecureStore.setItemAsync('userStorageID', JSON.stringify(userID)); // Salvar ID do usuario
        await AsyncStorage.setItem('emailVerificationStatus', 'true'); // Marca a verificação como pendente
        await AsyncStorage.setItem('emailVerificationData', JSON.stringify({ email, userID })); // Salva email e userID
  
        Alert.alert('Sucesso', 'Registrado com sucesso! Verifique seu e-mail para o código de verificação.');
        navigation.navigate('VerificationScreen', { email, userID, verificationType: 'signup' });

  
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