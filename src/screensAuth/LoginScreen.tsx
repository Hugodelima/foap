import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from "@env";
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';

export default function LoginScreen() {
    const navigation = useNavigation<NavigationProps>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useBackButtonHandler()

    const handleLogin = async () => {
        if (email.length === 0 || password.length === 0) {
            Alert.alert("Preencha todos os campos corretamente");
            return;
        }
    
        try {
            // Faz a requisição de login
            const response = await axios.post(`${API_URL}/api/userapi/login`, { email, password });
            const { userID } = response.data;
    
            // Armazena os tokens e navega para a próxima tela
            await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
            await SecureStore.setItemAsync('userStorageID', JSON.stringify(userID));

    
            Alert.alert("Logado com sucesso");
    
            navigation.navigate('MainNavigation');
        } catch (error: any) {
            console.error("Erro durante o login", error);
            Alert.alert("Erro durante o login", error.response?.data?.message || 'Erro ao tentar logar.');
        }
    };
    
    const handleRegister = () =>{
        navigation.navigate('FindUserScreen')
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className='flex-1 bg-gray-500'>
                    <SafeAreaView className='flex'>
                        <View className='flex-row justify-center'>
                            <Image source={{ uri: 'https://cdni.iconscout.com/illustration/premium/thumb/secure-login-and-password-illustration-download-in-svg-png-gif-file-formats--online-registration-sign-up-register-social-responsibility-pack-business-illustrations-6148085.png?f=webp' }}
                                style={{ width: 200, height: 250 }}
                            />
                        </View>
                    </SafeAreaView>

                    <View className='flex-1 bg-white px-8 pt-8'
                        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
                    >
                        <View className='form space-y-2'>
                            <Text className='text-gray-700 ml-4'>E-mail</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Entre com e-mail aqui"
                                keyboardType="email-address"
                            />
                            <Text className='text-gray-700 ml-4'>Senha</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl'
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Entre com a senha aqui"
                                secureTextEntry
                            />

                            <TouchableOpacity className='flex items-end mb-5' onPress={handleRegister}>
                                <Text className='text-yellow-600 font-bold'>Esqueceu a Senha?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleLogin}
                                className='py-3 bg-blue-400 rounded-xl'
                            >
                                <Text className='font-bold text-center text-gray-700'>
                                    Entrar
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        
                        <View className='flex-row justify-center mb-10 mt-4'>
                            <Text className='text-gray-500 font-semibold'>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                              <Text className='font-bold text-blue-500'>Cadastrar</Text>
                            </TouchableOpacity>
                        </View>
                       
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}