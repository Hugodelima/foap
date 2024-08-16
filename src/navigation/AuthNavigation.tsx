import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import React, { Component } from 'react'
import { Text, View } from 'react-native'

import WelcomeScreen from '../screensAuth/WelcomeScreen';
import LoginScreen from '../screensAuth/LoginScreen';
import SignUpScreen from '../screensAuth/SignUpScreen';
import AppNavigation from './AppNavigation';

import { SQLiteProvider ,useSQLiteContext} from 'expo-sqlite';


const initializeDatabase = async (db) => {
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome_usuario VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Banco de dados iniciado");
    } catch (error) {
        console.log("Erro na inicialização do banco", error);
    }
}

const Stack = createNativeStackNavigator();

export default function AuthNavigation() {
    return (
      <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Welcome'>
              <Stack.Screen name='Welcome' options={{headerShown: false}} component={WelcomeScreen} />
              <Stack.Screen name='Login' options={{headerShown: false}} component={LoginScreen} />
              <Stack.Screen name='SignUp' options={{headerShown: false}} component={SignUpScreen} />

              <Stack.Screen name='AppNavigation' options={{headerShown: false}} component={AppNavigation} />
          </Stack.Navigator>
        </NavigationContainer>
      </SQLiteProvider>
    )
  
}