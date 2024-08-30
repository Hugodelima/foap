import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';

export const useBackButtonHandler=()=>{
    useEffect(() => {
        const backAction = () => {
          Alert.alert("Sair", "Você deseja sair do aplicativo?", [
            {
              text: "Cancelar",
              onPress: () => null,
              style: "cancel"
            },
            { 
              text: "Sim", 
              onPress: () => BackHandler.exitApp() 
            }
          ]);
          return true; // Isso previne o comportamento padrão de voltar
        };
        // Adiciona o listener ao evento de voltar
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
        // Remove o listener quando o componente for desmontado, evitando vazamentos de memória
        return () => backHandler.remove();
    }, []);

}