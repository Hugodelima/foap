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
          <style>
            body {
              font-family: 'Arial', sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border: 1px solid #e2e8f0;
            }
            th {
              background-color: #4fd1c5;
              color: #ffffff;
              font-weight: bold;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
          </style>
        </head>
        <body class="bg-gray-50 text-gray-800 p-6">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-extrabold text-teal-600">Relatório de ${reportType.charAt(0).toUpperCase() + reportType.slice(1, reportType.length - 3)}</h1>
          </div>

          <table class="shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr>
                ${Object.keys(data[0])
                  .filter(key => key !== 'createdAt' && key !== 'updatedAt') // Filtra as colunas createdAt e updatedAt
                  .map((key) => `
                    <th class="px-4 py-2 text-sm font-semibold text-gray-800">${key}</th>
                  `)
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${data
                .map((item) => `
                  <tr class="hover:bg-gray-100">
                    ${Object.keys(item)
                      .filter(key => key !== 'createdAt' && key !== 'updatedAt') // Filtra as colunas createdAt e updatedAt
                      .map((key) => `
                        <td class="px-4 py-2 text-sm text-gray-700">${item[key]}</td>
                      `)
                      .join('')}
                  </tr>
                `)
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
