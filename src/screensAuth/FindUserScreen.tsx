// FindUserScreen.tsx
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import { NavigationProps } from '../navigation/types';

export default function FindUserScreen() {
    const navigation = useNavigation<NavigationProps>();
    const [email, setEmail] = useState<string>('');

    const handleFindUser = async () => {
        if (email.trim() === '') {
            Alert.alert("Erro", "O campo de e-mail não pode estar vazio.");
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/find-user`, { email });

            if (response.status === 200) {
                Alert.alert(response.data.message);
                navigation.navigate('VerificationForgotPassword', { email });
                
            } else {
                Alert.alert("E-mail não encontrado ou não está verificado.");
            }
        } catch (error) {
            console.error("Erro ao buscar o usuário:", error);
            Alert.alert("Erro", "Não foi possível encontrar o usuário.");
        }
    };

    return (
        
        <View className='flex-1 justify-center bg-white px-8'>
            <SafeAreaView className='absolute top-8'>
                <View>
                    <TouchableOpacity onPress={() => navigation.goBack()} className='bg-yellow-400 p-2 rounded-tr-2xl rounded-bl-2x1 ml-4 mt-4 absolute'>
                        <ArrowLeftIcon size='35' color='black' />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <Text className='text-lg font-bold mb-4'>Encontrar Usuário</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                className='border border-gray-300 p-2 rounded mb-4'
                keyboardType='email-address'
            />
            <TouchableOpacity onPress={handleFindUser} className='py-3 bg-yellow-400 rounded-xl'>
                <Text className='font-bold text-center text-gray-700'>Enviar Código</Text>
            </TouchableOpacity>
        </View>
    );
}
