import React from 'react';
import { Text, TouchableOpacity, View, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {NavigationProps} from '../navigation/types'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

import {useHandleGoogleOAuth} from '../hooks/handleGoogleOAuth'

export default function SignUpScreen() {
    const navigation = useNavigation<NavigationProps>();
    const {onPress} = useHandleGoogleOAuth();
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
                            <Text className='text-gray-700 ml-4'>Nome de Usuário:</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
                                placeholder="Entre com e-mail aqui"
                            />


                            <Text className='text-gray-700 ml-4'>E-mail:</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3'
                                value="teste@gmail.com"
                                placeholder="Entre com e-mail aqui"
                                keyboardType="email-address"
                            />
                            <Text className='text-gray-700 ml-4'>Senha:</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl'
                                value="12345"
                                placeholder="Entre com a senha aqui"
                                secureTextEntry
                            />
                            <Text className='text-gray-700 ml-4'>Repetir Senha:</Text>
                            <TextInput
                                className='p-4 bg-gray-100 text-gray-700 rounded-2xl'
                                value="12345"
                                placeholder="Entre com a senha aqui"
                                secureTextEntry
                            />

                            
                            <TouchableOpacity
                                className='py-3 bg-yellow-400 rounded-xl'
                            >
                                <Text className='font-bold text-center text-gray-700'>
                                  Cadastrar
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
                            <Text className='text-gray-500 font-semibold'>Já tem uma Conta? </Text>
                            <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                              <Text className='font-bold text-blue-500'>Entrar</Text>
                            </TouchableOpacity>
                        </View>
                       
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
