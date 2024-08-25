import React, { useState } from 'react';
import { Text, TouchableOpacity, View, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps, UserBD } from '../navigation/types';

export default function ResetPasswordScreen() {
    const navigation = useNavigation<NavigationProps>();

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    
    const handleRequestCode = async () => {
        try {
            const response = await axios.post('http://localhost:3000/send-verification-email', {
                email
            });
            if (response.status === 200) {
                Alert.alert('Código de verificação enviado para seu e-mail.');
            } else {
                Alert.alert('Erro ao enviar o código.');
            }
        } catch (error) {
            console.error('Erro ao solicitar o código:', error);
        }
    };

    const handleResetPassword = async () => {
        try {
            const response = await axios.post('http://localhost:3000/reset-password', {
                email,
                newPassword,
                verificationCode
            });
            if (response.status === 200) {
                Alert.alert('Senha redefinida com sucesso!');
                navigation.navigate('Login');
            } else {
                Alert.alert('Erro ao redefinir a senha.');
            }
        } catch (error) {
            console.error('Erro ao redefinir a senha:', error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
                <Text>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Digite seu e-mail"
                    keyboardType="email-address"
                />
                <TouchableOpacity onPress={handleRequestCode} style={{ backgroundColor: 'yellow', padding: 10, marginTop: 10 }}>
                    <Text>Enviar Código</Text>
                </TouchableOpacity>
                <Text>Código de Verificação</Text>
                <TextInput
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Digite o código recebido"
                />
                <Text>Nova Senha</Text>
                <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Digite sua nova senha"
                    secureTextEntry
                />
                <TouchableOpacity onPress={handleResetPassword} style={{ backgroundColor: 'yellow', padding: 10, marginTop: 10 }}>
                    <Text>Redefinir Senha</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
