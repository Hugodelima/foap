import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface MissionFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStatus: (status: string) => void;
}

const MissionFilterModal: React.FC<MissionFilterModalProps> = ({ visible, onClose, onSelectStatus }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-neutral-800 p-5 rounded-lg w-4/5">
          <Text className="text-white text-xl mb-4 font-bold text-center">Filtrar Missões</Text>
          
          <TouchableOpacity onPress={() => onSelectStatus('Finalizada')}>
            <Text className="text-white font-vt323 text-lg p-2">Finalizada</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelectStatus('Em progresso')}>
            <Text className="text-white font-vt323 text-lg p-2">Em progresso</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelectStatus('Não finalizada')}>
            <Text className="text-white font-vt323 text-lg p-2">Não finalizada</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSelectStatus('todos')}>
            <Text className="text-white font-vt323 text-lg p-2">Todos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text className="text-red-500 text-center font-bold">Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MissionFilterModal;
