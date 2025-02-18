import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ visible, onClose, onConfirm, message }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-neutral-800 p-6 rounded-lg w-80">
          <Text className="text-white text-lg mb-4">{message}</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 bg-gray-500 rounded-lg">
              <Text className="text-white">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} className="px-4 py-2 bg-red-500 rounded-lg">
              <Text className="text-white">Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
