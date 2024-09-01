import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, Alert, Keyboard, SafeAreaView, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '@env';
import { NavigationProps } from '../navigation/types';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

const inputs = Array(4).fill('');
let newInputIndex = 0;

const isObjValid = (obj: { [key: number]: string }) => {
    return Object.values(obj).every(val => val.trim());
}

export default function VerificationForgotPasswordScreen() {
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute();
    const { email } = route.params as { email: string };
    
    const input = useRef<TextInput>(null);

    const [OTP, setOTP] = useState<{ [key: number]: string }>({ 0: '', 1: '', 2: '', 3: '' });
    const [nextInputIndex, setNextInputIndex] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(120000); // 2 minutos em milissegundos
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        input.current?.focus();
    }, [nextInputIndex]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTime - 1000;
            });
        }, 1000);

        setTimer(interval);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleVerification = async (code: string) => {
        try {
            const response = await axios.post(`${API_URL}/verify-forgot-password`, {
                email,
                verificationCode: code
            });

            if (response.status === 200) {
                console.log(response.data);
                
                Alert.alert(response.data.message);
                navigation.navigate('ResetPasswordScreen', { email });
            } else {
                Alert.alert("Código de verificação inválido ou expirado.");
            }
        } catch (error: any) {
            const errorMessage = error.response.data?.message || "Erro durante a verificação.";
            Alert.alert("Erro", errorMessage);
            console.error("Erro durante a verificação:", error);
        }
    };

    const handleChangeText = (text: string, index: number) => {
        const newOTP = { ...OTP };
        newOTP[index] = text;
        setOTP(newOTP);

        const lastInputIndex = inputs.length - 1;
        if (!text) newInputIndex = index === 0 ? 0 : index - 1;
        else newInputIndex = index === lastInputIndex ? lastInputIndex : index + 1;
        setNextInputIndex(newInputIndex);
    }

    const submitOTP = () => {
        Keyboard.dismiss();

        if (isObjValid(OTP)) {
            let val = '';
            Object.values(OTP).forEach(v => {
                val += v;
            });

            handleVerification(val);
        } else {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
        }
    };

    const resendCode = async () => {
        try {
            const response = await axios.post(`${API_URL}/resend-forgot-password-code`, {
                email
            });

            if (response.status === 200) {
                Alert.alert("Código reenviado com sucesso! Verifique seu e-mail.");
                setTimeLeft(120000); // 2 minutos
            } else {
                Alert.alert("Erro ao reenviar código, tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao reenviar o código:", error);
            Alert.alert("Erro", "Não foi possível reenviar o código. Tente novamente.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className='flex-1 bg-gray-500'>
                    <SafeAreaView className='absolute top-8'>
                        <View>
                            <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4 absolute'>
                                <ArrowLeftIcon size='35' color='black' />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    <SafeAreaView className='flex'>
                        <View className='flex-row justify-center'>
                            <Image source={{ uri: 'https://ds9xi3hub5xxi.cloudfront.net/cdn/farfuture/otEn1mSO8Tk3mLVPFxYMCMwRn-qtie_ueonsviYMy0w/mtime:1608563955/sites/default/files/nodeicon/plugins_email-verification-plugin.png' }}
                                style={{ width: 200, height: 200, marginTop: 50 }}
                            />
                        </View>
                    </SafeAreaView>

                    <View className='flex-1 bg-white px-8 pt-8 mt-10'
                        style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}
                    >
                        <View className='form space-y-2'>
                            <Text className='text-lg font-bold'>
                                Verificação de E-mail
                            </Text> 
                            <Text>
                                Um código foi encaminhado no seu e-mail, por favor verifique-o
                            </Text> 

                            <View className='flex-row space-x-4 mt-5 justify-center mb-6'>
                                {inputs.map((inp, index) => (
                                    <View className='w-14 border border-yellow-400 items-center justify-center h-16 mt-5' key={index.toString()}>
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
                                className='py-3 bg-yellow-400 rounded-xl mb-4'
                                onPress={submitOTP}
                            >
                                <Text className='font-bold text-center text-gray-700'>
                                    Verificar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='py-3 bg-blue-400 rounded-xl mt-4'
                                onPress={resendCode}
                            >
                                <Text className='font-bold text-center text-gray-700'>
                                    Reenviar Código
                                </Text>
                            </TouchableOpacity>
                            {timeLeft > 0 && (
                                <Text className='text-center mt-4'>
                                    Código expira em {Math.floor(timeLeft / 60000)}:{('0' + Math.floor((timeLeft % 60000) / 1000)).slice(-2)}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
