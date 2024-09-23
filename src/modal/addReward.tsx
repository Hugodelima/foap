import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
}

export default function ModalReward({ visible, onClose}: ModalComponentProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        onPress={onClose} 
        className="flex-1 justify-center items-center bg-black/60"
      >
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-xl font-semibold mb-4 text-start">Adicionar Nova Recompensa</Text>
        </Pressable>
        
      </Pressable>
    </Modal>
  );
}
