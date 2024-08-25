import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, KeyboardAvoidingView, Alert, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserBD } from '../navigation/types';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const inputs = Array(4).fill('');
let newInputIndex = 0;

const isObjValid = (obj: { [key: number]: string }) => {
    return Object.values(obj).every(val => val.trim());
}

export default function VerificationScreen() {
    const navigation = useNavigation<NavigationProps>();
    const input = useRef<TextInput>(null);

    const [userID, setUserID] = useState<string>('');
    const [user, setUser] = useState<UserBD | null>(null);
    const [OTP, setOTP] = useState<{ [key: number]: string }>({0:'', 1:'', 2:'', 3:''});
    const [nextInputIndex, setNextInputIndex] = useState<number>(0);
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(60000); // 1 minuto em milissegundos
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function getIDUser() {
            const userID: any = await SecureStore.getItemAsync('userStorageID');
            setUserID(userID);

            try {
                const response = await axios.get(`http://localhost:3000/users/${userID}`);
                setUser(response.data);

                // Enviar código de verificação automaticamente
                if (response.status === 200 && response.data) {
                    try {
                        const emailResponse = await axios.post('http://localhost:3000/send-verification-email', {
                            email: response.data.email
                        });
                        if (emailResponse.status === 200) {
                            Alert.alert("Código enviado com sucesso! Verifique seu e-mail.");
                        } else {
                            Alert.alert("Erro ao enviar código, tente novamente.");
                        }
                    } catch (error) {
                        console.error("Erro ao enviar o código:", error);
                    }
                }
            } catch (error) {
                console.error("Erro ao obter usuário:", error);
            }
        }
        getIDUser();
    }, []);

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

    const handleVerification = async () => {
        if (!user) {
            Alert.alert("Usuário não encontrado.");
            return;
        }
        
        if (verificationCode.length === 0) {
            Alert.alert("Digite o código de verificação");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/verify', {
                userID,
                verificationCode
            });

            if (response.status === 200) {
                Alert.alert("Email verificado com sucesso!");
                navigation.navigate('Login');
            } else {
                Alert.alert("Código de verificação inválido ou expirado.");
            }
        } catch (error) {
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

    const submitOTP = async () => {
        Keyboard.dismiss();
    
        if (isObjValid(OTP)) {
            let val = '';
            Object.values(OTP).forEach(v => {
                val += v;
            });
    
            setVerificationCode(val);
    
            try {
                const response = await axios.post('http://localhost:3000/send-verification-email', {
                    email: user?.email
                });
    
                if (response.status === 200) {
                    Alert.alert("Código enviado com sucesso! Verifique seu e-mail.");
                } else {
                    Alert.alert("Erro ao enviar código, tente novamente.");
                }
            } catch (error) {
                console.error("Erro ao enviar o código:", error);
            }
        }
    };

    const resendCode = async () => {
        if (user) {
            try {
                const response = await axios.post('http://localhost:3000/resend-verification-code', {
                    email: user.email
                });

                if (response.status === 200) {
                    Alert.alert("Código reenviado com sucesso! Verifique seu e-mail.");
                    // Resetar o tempo do cronômetro para 1 minuto
                    setTimeLeft(60000);
                } else {
                    Alert.alert("Erro ao reenviar código, tente novamente.");
                }
            } catch (error) {
                console.error("Erro ao reenviar o código:", error);
            }
        }
    };

    return (
        <KeyboardAvoidingView className='flex-1 justify-center'>
            <Text>
                Um código foi encaminhado no seu e-mail, por favor verifique-o
            </Text>
            <View className='flex-row justify-between pl-14 pr-14 mt-9'>
                {inputs.map((inp, index) => (
                    <View className='text-center w-14 border border-yellow-400 items-center justify-center h-20' key={index.toString()}>
                        <TextInput 
                            onChangeText={(text) => handleChangeText(text, index)}
                            value={OTP[index]}
                            placeholder='0' 
                            keyboardType='numeric' 
                            maxLength={1}
                            ref={nextInputIndex === index ? input : null}
                        />
                    </View> 
                ))}
            </View>
            <TouchableOpacity
                className='py-3 bg-yellow-400 rounded-xl'
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
        </KeyboardAvoidingView>
    );
}
