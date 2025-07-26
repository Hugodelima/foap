import React, { useState, useRef } from 'react';
import { 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert, 
  Modal, 
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useBackButtonHandler } from '../hooks/useBackButtonHandler';
import signup_image from '../assets/images/signup/Sign_Up.png';

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useBackButtonHandler();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= 
                      contentSize.height - paddingToBottom;
    setScrolledToBottom(isAtBottom);
  };

  const isValidEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const createAttributesAndBadges = async (userID: string) => {
    const atributos = [
      { nome: 'Inteligência', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1945/1945713.png' },
      { nome: 'Criatividade', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1497/1497726.png' },
      { nome: 'Disciplina', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/4729/4729468.png' },
      { nome: 'Confiança', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5828/5828162.png' },
      { nome: 'Carisma', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/8420/8420287.png' },
      { nome: 'Empatia', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5894/5894104.png' },
      { nome: 'Comunicação', tipo: 'Mental', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/5864/5864217.png' },
      { nome: 'Agilidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/1388/1388519.png' },
      { nome: 'Resistência', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/15888/15888479.png' },
      { nome: 'Flexibilidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/2373/2373008.png' },
      { nome: 'Equilíbrio', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/2043/2043960.png' },
      { nome: 'Força', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/3476/3476001.png' },
      { nome: 'Reação', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/764/764221.png' },
      { nome: 'Velocidade', tipo: 'Físico', valor: 0, icone: 'https://cdn-icons-png.flaticon.com/512/6534/6534475.png' }
    ];
  
    const badges = [
      { titulo: "Rank F", descricao: "Iniciante na jornada", conquistado: false, icone: '1' },
      { titulo: "Rank E", descricao: "Alcançou o rank E", conquistado: false, icone: '2' },
      { titulo: "Rank D", descricao: "Alcançou o rank D", conquistado: false, icone: '3' },
      { titulo: "Rank C", descricao: "Alcançou o rank C", conquistado: false, icone: '4' },
      { titulo: "Rank B", descricao: "Alcançou o rank B", conquistado: false, icone: '5' },
      { titulo: "Rank A", descricao: "Alcançou o rank A", conquistado: false, icone: '6' },
      { titulo: "Rank S", descricao: "Alcançou o rank S", conquistado: false, icone: '7' },
      { titulo: "Rank SS", descricao: "Alcançou o rank SS", conquistado: false, icone: '8' },
      { titulo: "Rank SSS", descricao: "Alcançou o rank SSS", conquistado: false, icone: '9' },
      { titulo: "Rank SSS+", descricao: "Alcançou o rank SSS+", conquistado: false, icone: '10' },
      { titulo: "Iniciante", descricao: "Primeira missão concluída com sucesso", conquistado: false, icone: '11' },
      { titulo: "Guerreiro da Rotina", descricao: "Completou 10 missões", conquistado: false, icone: '12' },
      { titulo: "Mestre da Disciplina", descricao: "Completou 50 missões", conquistado: false, icone: '13' },
      { titulo: "Lendário", descricao: "Completou 100 missões", conquistado: false, icone: '14' },
      { titulo: "Maratonista", descricao: "Realizou missões por 7 dias seguidos", conquistado: false, icone: '15' },
      { titulo: "Imbatível", descricao: "Completou uma missão desafiadora", conquistado: false, icone: '16' },
      { titulo: "Caçador de Ouro", descricao: "Acumulou 10.000 de ouro", conquistado: false, icone: '17' },
      { titulo: "Poder Supremo", descricao: "Acumulou 100 pontos de atributos", conquistado: false, icone: '18' },
      { titulo: "Estrategista", descricao: "Acumulou 10.000 de XP", conquistado: false, icone: '19' }
    ];
  
    try {
      await Promise.all([
        Promise.all(atributos.map(atributo =>
          axios.post(`${API_URL}/api/attributeapi/create`, { ...atributo, id_usuario: userID })
        )),
        Promise.all(badges.map(badge =>
          axios.post(`${API_URL}/api/badgeapi/create`, { ...badge, id_usuario: userID })
        ))
      ]);
    } catch (error) {
      console.error('Erro ao criar atributos ou badges:', error);
      Alert.alert('Erro', 'Falha ao criar atributos ou badges.');
    }
  };
  
  const handleRegister = async () => {
    if (!privacyRead) {
      Alert.alert("Erro", "Você precisa ler e aceitar a política de privacidade para se cadastrar");
      return;
    }

    if (username.length === 0 || email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      Alert.alert("Erro", "Preencha todos os campos corretamente");
      return;
    } else if (!isValidEmail(email)) {
      Alert.alert("Erro", "O e-mail fornecido não é válido.");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }
  
    try {
      console.log(API_URL)
      const response = await axios.post(`${API_URL}/api/userapi/register`, {
        nome_usuario: username,
        email,
        senha: password,
      });
  
      if (response.status === 200) {
        const { userID } = response.data;

        try {
          await axios.post(`${API_URL}/api/verificationapi/generate/${userID}`);
          await axios.post(`${API_URL}/api/statusapi/create/${userID}`);
          await createAttributesAndBadges(userID);

          await SecureStore.setItemAsync('userStorageID', JSON.stringify(userID));
          await AsyncStorage.setItem('emailVerificationStatus', 'true');
          await AsyncStorage.setItem('emailVerificationData', JSON.stringify({ email, userID }));
  
          Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Verifique seu e-mail para o código de verificação.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'VerificationScreen', params: { email, userID, verificationType: 'signup' } }],
          });
          
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } catch (error) {
          console.error('Erro no processo de cadastro:', error);
          Alert.alert('Erro', 'Ocorreu um erro durante o cadastro.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro durante o cadastro, tente novamente.';
      Alert.alert('Erro', errorMessage);
    }
  };

  const privacyPolicyText = (
    <Text className="text-gray-700 text-sm leading-6">
      <Text className="font-bold text-center text-lg block mb-4">
        📄 Política de Privacidade – Foap{"\n"}
      </Text>
      <Text className="font-bold text-center text-gray-500 block mb-6">
        Última atualização: 25 de julho de 2025{"\n\n"}
      </Text>

      <Text className="block mb-4">
        O aplicativo Foap foi desenvolvido para oferecer aos usuários uma forma divertida e eficaz de gerenciar tarefas diárias.{"\n\n"}
      </Text>

      <Text className="font-bold text-base mt-4 mb-2 block">1. Informações Coletadas{"\n"}</Text>
      <Text className="block mb-2">Coletamos apenas:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- E-mail{"\n"}</Text>
      <Text className="block ml-4 mb-4">- Senha{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">2. Como os Dados São Coletados{"\n"}</Text>
      <Text className="block mb-4">Através do formulário de cadastro/login.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">3. Uso das Informações{"\n"}</Text>
      <Text className="block mb-2">As informações são usadas para:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Autenticação do usuário;{"\n"}</Text>
      <Text className="block ml-4 mb-4">- Acesso seguro aos recursos do app.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">4. Armazenamento de Dados{"\n"}</Text>
      <Text className="block mb-4">Os dados são armazenados em servidores seguros.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">5. Direitos dos Usuários{"\n"}</Text>
      <Text className="block mb-2">Atualmente o app não possui funcionalidades para:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Exclusão de conta;{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Solicitação de remoção de dados;{"\n"}</Text>
      <Text className="block ml-4 mb-4">- Acesso aos dados armazenados.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">6. Crianças e Adolescentes{"\n"}</Text>
      <Text className="block mb-4">Recomendado para maiores de 13 anos.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">7. Alterações na Política{"\n"}</Text>
      <Text className="block mb-4">Esta política pode ser atualizada periodicamente.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">8. Contato{"\n"}</Text>
      <Text className="block mb-6">Para dúvidas, entre em contato pelo app.{"\n\n"}</Text>

      <Text className="font-bold text-center block mt-6">
        Ao usar o Foap, você concorda com esta Política de Privacidade.{"\n"}
      </Text>
    </Text>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 bg-gray-500">
          <SafeAreaView className="flex">
            <View className="flex-row justify-center">
              <Image source={signup_image} className="w-48 h-48" />
            </View>
          </SafeAreaView>

          <View className="flex-1 bg-white px-8 pt-8 rounded-t-[50px]">
            <View className="space-y-2">
              <Text className="text-gray-700 ml-4">Nome de Usuário:</Text>
              <TextInput
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChangeText={setUsername}
              />

              <Text className="text-gray-700 ml-4">E-mail:</Text>
              <TextInput
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu e-mail"
                keyboardType="email-address"
              />

              <Text className="text-gray-700 ml-4">Senha:</Text>
              <TextInput
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                secureTextEntry
              />

              <Text className="text-gray-700 ml-4">Confirmar Senha:</Text>
              <TextInput
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-4"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirme sua senha"
                secureTextEntry
              />

              <View className="flex-row items-center my-4">
                <TouchableOpacity 
                  onPress={() => {
                    if (!privacyRead) {
                      setModalVisible(true);
                    } else {
                      setPrivacyRead(false);
                    }
                  }}
                  className={`w-6 h-6 rounded border ${privacyRead ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} justify-center items-center mr-2`}
                >
                  {privacyRead && <Text className="text-white">✓</Text>}
                </TouchableOpacity>
                <Text className="text-gray-700 flex-1 flex-wrap">
                  Eu li e aceito a{' '}
                  <Text 
                    className="text-blue-500 underline"
                    onPress={() => setModalVisible(true)}
                  >
                    política de privacidade
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                className="py-3 bg-blue-500 rounded-xl"
                onPress={handleRegister}
              >
                <Text className="font-bold text-center text-white">
                  Cadastrar
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <SafeAreaView className="flex-1 bg-black/50 justify-center items-center p-4">
                <View className="w-full max-h-[80%] bg-white rounded-2xl overflow-hidden">
                  <View className="p-5">
                    <Text className="text-lg font-bold mb-4 text-center text-gray-800">
                      Política de Privacidade
                    </Text>
                  </View>
                  
                  <ScrollView 
                    ref={scrollViewRef}
                    className="px-5"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {privacyPolicyText}
                  </ScrollView>
                  
                  <View className="flex-row justify-between p-5 border-t border-gray-200">
                    <Pressable
                      className="px-5 py-2 bg-gray-300 rounded-md"
                      onPress={() => setModalVisible(false)}
                    >
                      <Text>Fechar</Text>
                    </Pressable>
                    <Pressable
                      className={`px-5 py-2 rounded-md ${scrolledToBottom ? 'bg-blue-500' : 'bg-gray-400'}`}
                      onPress={() => {
                        if (scrolledToBottom) {
                          setPrivacyRead(true);
                          setModalVisible(false);
                        }
                      }}
                      disabled={!scrolledToBottom}
                    >
                      <Text className="text-white font-bold">Aceitar</Text>
                    </Pressable>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            <View className="flex-row justify-center mb-10 mt-4">
              <Text className="text-gray-500 font-semibold">Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="font-bold text-blue-500">Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}