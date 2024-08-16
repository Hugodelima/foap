import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { useNavigation } from '@react-navigation/native';
import {NavigationProps} from '../navigation/types'

import {useHandleGoogleOAuth} from '../hooks/handleGoogleOAuth'

import { useSQLiteContext } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

export default function LoginScreen() {

    const navigation = useNavigation<NavigationProps>();
    const {onPress} = useHandleGoogleOAuth();

    const db = useSQLiteContext()
    const [email,setEmail] =  useState('')
    const [password,setPassword] = useState('')

    const handleRegister = async() =>{
        if(email.length === 0 || password.length === 0){
            Alert.alert("Preencha todos os campos corretamente")
            return;
        }
        try {
            
            const existingEmail = await db.getFirstAsync('SELECT email FROM usuarios WHERE email = ?',[email])
            
            if (!existingEmail) {
                Alert.alert("Email ou senha não conferem")
                return
            }

            const hash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA512,password
            );
            console.log("hashlogin: "+hash);
            
            const validUser = await db.getFirstAsync('SELECT * FROM usuarios WHERE email = ? AND senha = ?',[email,hash])
            
            if (validUser) {
                Alert.alert("Logado com sucesso");
                navigation.navigate("AppNavigation")
            }
            
        } catch (error) {
            console.log("Erro durante o login",error);
            
        }
    }
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className='flex-1 bg-gray-500'>
                    <SafeAreaView className='flex'>
                        <View className='flex-row justify-start'>
                            <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4 absolute'>
                                <ArrowLeftIcon size='20' color='black' />
                            </TouchableOpacity>
                        </View>

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

                            <TouchableOpacity className='flex items-end mb-5'>
                                <Text className='text-gray-700'>Esqueceu a Senha?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleRegister}
                                className='py-3 bg-yellow-400 rounded-xl'
                            >
                                <Text className='font-bold text-center text-gray-700'>
                                    Entrar
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
                            <Text className='text-gray-500 font-semibold'>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={()=> navigation.navigate('SignUp')}>
                              <Text className='font-bold text-blue-500'>Cadastrar</Text>
                            </TouchableOpacity>
                        </View>
                       
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
