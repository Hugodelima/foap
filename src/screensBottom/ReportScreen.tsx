import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system'; // Importando expo-file-system
import { API_URL } from '@env';
import axios from 'axios';
import { getUserId } from './MissionScreen';

export default function ReportScreen() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Função para buscar os dados e gerar o PDF
  const handleGenerateReport = async (reportType: string) => {
    try {
      setIsGenerating(true);

      // Busca os dados da API
      const userId = await getUserId();
      const response = await axios.get(`${API_URL}/api/${reportType}/${userId}`);
      const data = response.data;

      if (!data || data.length === 0) {
        Alert.alert('Sem dados', 'Nenhum dado disponível para o relatório.');
        setIsGenerating(false);
        return;
      }

      // Gera o HTML do relatório com Tailwind CSS
      const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="p-4 bg-gray-100 text-gray-900">
        <h1 class="text-2xl font-bold mb-4">Relatório de ${reportType.toUpperCase()}</h1>
        <table class="w-full border-collapse border border-gray-400">
          <thead>
            <tr class="bg-gray-300">
              ${Object.keys(data[0])
                .map((key) => `<th class="border border-gray-400 p-2">${key}</th>`)
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (item) => `
              <tr class="bg-white border-b">
                ${Object.values(item)
                  .map((value) => `<td class="border border-gray-400 p-2">${value}</td>`)
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
      `;

      // Gera o PDF e pega o URI do arquivo
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF gerado em:', uri);

      // Copiando o arquivo para o diretório de cache adequado para que o FileProvider possa acessá-lo
      const filePath = FileSystem.documentDirectory + 'report.pdf';
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      // Agora, gerar um URI do tipo content://
      const contentUri = await FileSystem.getContentUriAsync(filePath);
      console.log('Content URI:', contentUri);

      // Agora, abrir o PDF automaticamente usando o expo-intent-launcher com o URI do conteúdo
      await openPdf(contentUri);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openPdf = async (uri: string) => {
    try {
      if (Platform.OS === 'android') {
        // Usando a ação "android.intent.action.VIEW" para abrir o arquivo PDF de forma segura no Android
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: uri,
          flags: 1, // A flag para garantir permissões
        });
      }
    } catch (error) {
      console.log('Erro ao abrir o PDF:', error);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo PDF.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <SafeAreaView className="gap-8 mt-6 p-4">
        <TouchableOpacity
          onPress={() => handleGenerateReport('missionapi')}
          className="bg-cyan-500 rounded-full p-3"
          disabled={isGenerating}
        >
          <Text className="text-white font-bold text-center">Relatório de Missões</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenerateReport('rewardapi')}
          className="bg-cyan-500 rounded-full p-3"
          disabled={isGenerating}
        >
          <Text className="text-white font-bold text-center">Relatório de Recompensas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenerateReport('penaltyapi')}
          className="bg-cyan-500 rounded-full p-3"
          disabled={isGenerating}
        >
          <Text className="text-white font-bold text-center">Relatório de Penalidades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenerateReport('statusapi')}
          className="bg-cyan-500 rounded-full p-3"
          disabled={isGenerating}
        >
          <Text className="text-white font-bold text-center">Relatório de Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleGenerateReport('attributeapi')}
          className="bg-cyan-500 rounded-full p-3"
          disabled={isGenerating}
        >
          <Text className="text-white font-bold text-center">Relatório de Atributos</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
