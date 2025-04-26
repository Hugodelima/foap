import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, Alert, Keyboard, SafeAreaView, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { NavigationProps } from '../navigation/types';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const inputs = Array(4).fill('');

export default function VerificationScreen() {
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute();
    const [email, setEmail] = useState<string | undefined>(route.params?.email);
    const [userID, setUserID] = useState<string | undefined>(route.params?.userID);
    const [verificationType, setVerificationType] = useState<string | undefined>(route.params?.verificationType);
    const [emailVerificationStatus, setEmailVerificationStatus] = useState('');
    const [initialTimeLeft, setInitialTimeLeft] = useState<number>(0);

    const input = useRef<TextInput>(null);
    const [OTP, setOTP] = useState<{ [key: number]: string }>({ 0: '', 1: '', 2: '', 3: '' });
    const [nextInputIndex, setNextInputIndex] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Função para buscar o tempo restante do código do banco de dados
    const fetchVerificationExpiration = async () => {
        try {
            const endpoint = verificationType === 'forgotPassword'
                ? `${API_URL}/api/verificationapi/get-forgot-password-expiration`
                : `${API_URL}/api/verificationapi/get-verification-expiration`;

            const response = await axios.get(endpoint, {
                params: { 
                    userID: verificationType === 'forgotPassword' ? undefined : userID,
                    email: verificationType === 'forgotPassword' ? email : undefined
                }
            });

            if (response.data.timeLeft > 0) {
                setTimeLeft(response.data.timeLeft);
                setInitialTimeLeft(response.data.timeLeft);
            } else {
                setTimeLeft(0);
            }
        } catch (error) {
            console.error("Erro ao buscar expiração:", error);
            setTimeLeft(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadVerificationData = async () => {
            const status = await AsyncStorage.getItem('emailVerificationStatus');
            setEmailVerificationStatus(status || '');

            if (!email || !userID) {
                try {
                    const storedData = await AsyncStorage.getItem('emailVerificationData');
                    if (storedData) {
                        const { email: storedEmail, userID: storedUserID } = JSON.parse(storedData);
                        setEmail(storedEmail);
                        setUserID(storedUserID);
                    }
                } catch (error) {
                    console.error("Erro ao recuperar dados de verificação:", error);
                }
            }

            // Buscar o tempo de expiração do banco de dados
            await fetchVerificationExpiration();
        };

        loadVerificationData();
    }, []);

    useEffect(() => {
        input.current?.focus();
    }, [nextInputIndex]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        
        const interval = setInterval(() => {
            setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1000 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleVerification = async (code: string) => {
        try {
            const endpoint = verificationType === 'forgotPassword'
                ? `${API_URL}/api/verificationapi/verify-forgot-password`
                : `${API_URL}/api/verificationapi/verify`;

            const payload = verificationType === 'forgotPassword'
                ? { email, verificationCode: code }
                : { userID, verificationCode: code };

            const response = await axios.post(endpoint, payload);

            if (response.status === 200) {
                Alert.alert(response.data.message);
                await AsyncStorage.setItem('emailVerificationStatus', '');
                await SecureStore.setItemAsync('userStorageID', '');
                
                if (verificationType === 'forgotPassword') {
                    navigation.navigate('ResetPasswordScreen', { email });
                } else {
                    navigation.navigate('Login');
                }
                
                setOTP({ 0: '', 1: '', 2: '', 3: '' });
                setTimeLeft(0);
            } else {
                Alert.alert("Código de verificação inválido ou expirado.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Erro durante a verificação.";
            Alert.alert("Erro", errorMessage);
        }
    };

    const handleChangeText = (text: string, index: number) => {
        const newOTP = { ...OTP, [index]: text };
        setOTP(newOTP);

        const lastInputIndex = inputs.length - 1;
        setNextInputIndex(!text ? (index === 0 ? 0 : index - 1) : (index === lastInputIndex ? lastInputIndex : index + 1));
    };

    const submitOTP = () => {
        Keyboard.dismiss();
        if (Object.values(OTP).every(val => val.trim())) {
            handleVerification(Object.values(OTP).join(''));
        } else {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
        }
    };

    const resendCode = async () => {
        try {
            const endpoint = verificationType === 'forgotPassword'
                ? `${API_URL}/api/verificationapi/resend-forgot-password-code`
                : `${API_URL}/api/verificationapi/resend-verification-code`;

            const payload = verificationType === 'forgotPassword'
                ? { email }
                : { email };

            const response = await axios.post(endpoint, payload);

            if (response.status === 200) {
                Alert.alert("Código reenviado com sucesso! Verifique seu e-mail.");
                // Atualizar o tempo restante após reenvio
                await fetchVerificationExpiration();
            } else {
                Alert.alert("Erro ao reenviar código, tente novamente.");
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível reenviar o código. Tente novamente.");
        }
    };

    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>Carregando...</Text>
            </View>
        );
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
                            <Image 
                                source={{ uri: 'https://png.pngtree.com/png-vector/20221106/ourmid/pngtree-email-icon-blue-for-your-project-clipart-transparent-background-png-image_6401859.png' }}
                                style={{ width: 200, height: 150, marginTop: 50 }}
                            />
                        </View>
                    </SafeAreaView>

                    <View className='flex-1 bg-white px-8 pt-8 mt-10' style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
                        <View className='form space-y-2'>
                            <Text className='text-lg font-bold'>
                                {verificationType === 'forgotPassword' ? 'Redefinição de Senha' : 'Verificação de E-mail'}
                            </Text> 
                            <Text>
                                Um código foi enviado para seu e-mail. Por favor, verifique-o.
                            </Text> 

                            <View className='flex-row space-x-4 mt-5 justify-center mb-6'>
                                {inputs.map((_, index) => (
                                    <View className='w-14 border border-blue-400 items-center justify-center h-16 mt-5' key={index.toString()}>
                                        <TextInput
                                            onChangeText={(text) => handleChangeText(text, index)}
                                            value={OTP[index]}
                                            placeholder='0'
                                            keyboardType='numeric'
                                            maxLength={1}
                                            ref={nextInputIndex === index ? input : null}
                                            className='text-center'
                                        />
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity 
                                className='py-3 bg-blue-400 rounded-xl mb-4' 
                                onPress={submitOTP}
                                disabled={timeLeft <= 0}
                            >
                                <Text className='font-bold text-center text-gray-700'>Verificar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                className='py-3 bg-cyan-400 rounded-xl mt-4' 
                                onPress={resendCode}
                            >
                                <Text className='font-bold text-center text-gray-700'>Reenviar Código</Text>
                            </TouchableOpacity>

                            {timeLeft > 0 ? (
                                <Text className='text-center mt-4'>
                                    Código expira em {formatTime(timeLeft)}
                                </Text>
                            ) : (
                                <Text className='text-center mt-4 text-red-500'>
                                    Código expirado. Por favor, solicite um novo código.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}