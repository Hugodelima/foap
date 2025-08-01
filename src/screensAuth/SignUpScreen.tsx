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
import { MaterialIcons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProps>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      Alert.alert("Erro", "Você precisa aceitar a política de privacidade para se cadastrar");
      return;
    }

    if (username.length === 0 || email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    } else if (!isValidEmail(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido");
      return;
    } else if (password.length < 8) {
      Alert.alert("Erro", "A senha deve ter no mínimo 8 caracteres");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }
  
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        O aplicativo Foap – Transformando Tarefas em Conquistas foi desenvolvido com o objetivo de oferecer aos usuários uma forma divertida e eficaz de gerenciar tarefas diárias, utilizando elementos de gamificação como missões, recompensas, medalhas e status de RPG.{"\n"}
        Esta Política de Privacidade tem como objetivo esclarecer como os dados dos usuários são coletados, usados e protegidos.{"\n\n"}
      </Text>

      <Text className="font-bold text-base mt-4 mb-2 block">1. Informações Coletadas{"\n"}</Text>
      <Text className="block mb-2">O Foap coleta apenas os seguintes dados dos usuários:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Nome de Usuário{"\n"}</Text>
      <Text className="block ml-4 mb-1">- E-mail{"\n"}</Text>
      <Text className="block ml-4 mb-4">- Senha{"\n\n"}</Text>
      <Text className="block mb-4">Essas informações são fornecidas voluntariamente pelo usuário no momento do cadastro.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">2. Como os Dados São Coletados{"\n"}</Text>
      <Text className="block mb-4">Os dados são coletados diretamente através do formulário de cadastro/login do aplicativo.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">3. Uso das Informações{"\n"}</Text>
      <Text className="block mb-2">As informações coletadas são utilizadas exclusivamente para:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Autenticação e identificação do usuário;{"\n\n"}</Text>
      <Text className="block ml-4 mb-4">- Acesso seguro às funcionalidades do aplicativo.{"\n\n"}</Text>
      <Text className="block mb-4">Não compartilhamos os dados dos usuários com terceiros.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">4. Armazenamento de Dados{"\n"}</Text>
      <Text className="block mb-4">Os dados são armazenados em servidores seguros da plataforma Render.com. O desenvolvedor do aplicativo adota medidas técnicas razoáveis para garantir a proteção e integridade das informações dos usuários.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">5. Direitos dos Usuários{"\n"}</Text>
      <Text className="block mb-2">Atualmente, o aplicativo não possui funcionalidades internas para:{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Exclusão de conta;{"\n"}</Text>
      <Text className="block ml-4 mb-1">- Solicitação de remoção de dados;{"\n"}</Text>
      <Text className="block ml-4 mb-4">- Acesso aos dados armazenados.{"\n\n"}</Text>
      <Text className="block mb-1">Entretanto, caso o usuário deseje excluir sua conta ou solicitar a remoção de seus dados, deverá entrar em contato por meio do e-mail suportefoap5@gmail.com.{"\n"}</Text>
      <Text className="block mb-4">Para mais detalhes sobre esse processo, acesse o seguinte link: [https://drive.google.com/file/d/1vjCtbaPhA0ULgpJSgmtTHzCDf8j5URBz/view?usp=sharing].{"\n"}Caso essas opções venham a ser implementadas diretamente no aplicativo no futuro, esta Política de Privacidade será devidamente atualizada.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">6. Crianças e Adolescentes{"\n"}</Text>
      <Text className="block mb-4">O aplicativo não possui restrição etária, mas é recomendado para uso por maiores de 13 anos, considerando a autonomia necessária para o gerenciamento de tarefas.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">7. Alterações nesta Política{"\n"}</Text>
      <Text className="block mb-4">Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que o usuário consulte esta seção regularmente para se manter informado sobre eventuais mudanças.{"\n\n"}</Text>

      <Text className="font-bold text-base mt-4 mb-2 block">8. Contato{"\n"}</Text>
      <Text className="block mb-6">Em caso de dúvidas sobre esta Política de Privacidade, o usuário pode entrar em contato diretamente com o desenvolvedor pelo seguinte email suportefoap5@gmail.com.{"\n\n"}</Text>

      <Text className="font-bold text-center block mt-6">
        Ao utilizar o Foap, você concorda com os termos descritos nesta Política de Privacidade.{"\n"}
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

              <Text className="text-gray-700 ml-4">Senha (mínimo 8 caracteres):</Text>
              <View className="relative">
                <TextInput
                  className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Digite sua senha"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  className="absolute right-3 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons 
                    name={showPassword ? 'visibility-off' : 'visibility'} 
                    size={24} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-700 ml-4">Confirmar Senha:</Text>
              <View className="relative">
                <TextInput
                  className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-4"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirme sua senha"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  className="absolute right-3 top-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons 
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                    size={24} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center my-4">
                <TouchableOpacity 
                  onPress={() => setPrivacyRead(!privacyRead)}
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
                className="py-3 bg-blue-500 rounded-xl flex-row justify-center items-center"
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text className="font-bold text-center text-white">
                    Cadastrando...
                  </Text>
                ) : (
                  <Text className="font-bold text-center text-white">
                    Cadastrar
                  </Text>
                )}
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
                      className="px-5 py-2 bg-blue-500 rounded-md"
                      onPress={() => {
                        setPrivacyRead(true);
                        setModalVisible(false);
                      }}
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