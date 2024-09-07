import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import { useHandleGoogleOAuth } from '../hooks/handleGoogleOAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';


export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { onPress } = useHandleGoogleOAuth(); // Função para login com Google

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
    }else if (!isValidEmail(email)) {
      Alert.alert("Erro", "O e-mail fornecido não é válido.");
      return;
    }else if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/userapi/register`, {
        username,
        email,
        password
      });
      
      if (response.status === 200) {
        const { userID } = response.data;

        console.log('signup id: '+userID)

        await SecureStore.setItemAsync('userStorageID', JSON.stringify(userID));
        await AsyncStorage.setItem('emailVerificationStatus', 'true'); // Marca a verificação como pendente

        Alert.alert("Sucesso", "Registrado com sucesso! Verifique seu e-mail para o código de verificação.");
        
        navigation.navigate('VerificationScreen');
        // Limpar os inputs após a verificação bem-sucedida
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

      } else {
        Alert.alert("Erro", "Erro ao registrar, tente novamente.");
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro durante o cadastro, tente novamente.";
      Alert.alert("Erro", errorMessage);
      console.log(error);
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
              <Image source={{ uri: 'https://portal.longitude.com.br/resource/1676002128000/BannerLogin' }}
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
                className='py-3 bg-yellow-400 rounded-xl'
                onPress={handleRegister}
              >
                <Text className='font-bold text-center text-gray-700'>
                  Cadastrar
                </Text>
              </TouchableOpacity>
            </View>
            <Text className='font-bold text-gray-700 text-center py-5'>
              Ou
            </Text>
            <View className='flex-row justify-center'>
              <TouchableOpacity onPress={onPress} className='p-2 bg-gray-100 rounded-2xl'>
                <Image source={{ uri: 'https://static-00.iconduck.com/assets.00/google-icon-2048x2048-pks9lbdv.png' }}
                  className='w-10 h-10 rounded-full' />
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
