import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from '../screensAuth/WelcomeScreen';
import LoginScreen from '../screensAuth/LoginScreen';
import SignUpScreen from '../screensAuth/SignUpScreen';
import VerificationScreen from '../screensAuth/VerificationScreen';
import ResetPasswordScreen from '../screensAuth/ResetPasswordScreen';
import BottomNavigation from './BottomNavigation';
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
    useBackButtonHandler()
    const [initialRoute, setInitialRoute] = useState<string | undefined>(undefined);

    useEffect(() => {
        const checkVerificationStatus = async () => {
        try {
            const emailVerificationStatus = await AsyncStorage.getItem('emailVerificationStatus');
            
            if (emailVerificationStatus === 'true') {
            setInitialRoute('VerificationScreen');
            } else {
            setInitialRoute('Welcome'); // Ou 'Login', conforme a lógica que você deseja
            }
        } catch (error) {
            console.error("Erro ao verificar o status do e-mail:", error);
        }
        };

        checkVerificationStatus();
    }, []);

    if (initialRoute === undefined) {
        return null; // Mostrar um indicador de carregamento enquanto a verificação está em andamento
    }

    return (
        <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name='Welcome' options={{ headerShown: false }} component={WelcomeScreen} />
            <Stack.Screen name='Login' options={{ headerShown: false }} component={LoginScreen} />
            <Stack.Screen name='SignUp' options={{ headerShown: false }} component={SignUpScreen} />
            <Stack.Screen name='VerificationScreen' options={{ headerShown: false }} component={VerificationScreen} />
            <Stack.Screen name='ResetPasswordScreen' options={{ headerShown: false }} component={ResetPasswordScreen} />
            <Stack.Screen name='BottomNavigation' options={{ headerShown: false }} component={BottomNavigation} />
        </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AuthNavigation;
