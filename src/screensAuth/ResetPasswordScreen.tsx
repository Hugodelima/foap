// ResetPasswordScreen.tsx
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_URL } from '@env';
import { NavigationProps } from '../navigation/types';

export default function ResetPasswordScreen() {
    const navigation = useNavigation<NavigationProps>();
    const route = useRoute();
    const { email } = route.params as { email: string };
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const handleResetPassword = async () => {
        if(password.trim() === '' || confirmPassword.trim() ===''){
            Alert.alert("Erro", "O campo de senha ou confirma senha não pode estar vazio.");
            return;
        }
        else if (password !== confirmPassword) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/userapi/reset-password`, {
                email,
                nova_senha: password
            });
            if (response.status === 200) {
                Alert.alert("Sucesso", "Senha redefinida com sucesso!");
                navigation.navigate('Login');
            } else {
                Alert.alert("Erro", "Não foi possível redefinir a senha. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao redefinir a senha:", error);
            Alert.alert("Erro", "Ocorreu um erro ao redefinir a senha.");
        }
    };

    return (
        <View className='flex-1 justify-center bg-white px-8'>
            <Text className='text-lg font-bold mb-4'>Redefinir Senha</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua nova senha"
                secureTextEntry
                className='border border-gray-300 p-2 rounded mb-4'
            />
            <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua nova senha"
                secureTextEntry
                className='border border-gray-300 p-2 rounded mb-4'
            />
            <TouchableOpacity onPress={handleResetPassword} className='py-3 bg-blue-400 rounded-xl'>
                <Text className='font-bold text-center text-gray-700'>Redefinir Senha</Text>
            </TouchableOpacity>
        </View>
    );
}


           
