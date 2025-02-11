import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export default function ModalComponent({ visible, onClose, onNavigate }: ModalComponentProps) {
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
        <Pressable className="w-80 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-xl font-semibold mb-4 text-center">Opções</Text>
          <TouchableOpacity onPress={() => { onClose(); onNavigate('ChangeUserDataScreen'); }}>
            <Text className="text-white text-lg mb-3">Configurações Cadastrais</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onClose(); onNavigate('AttributesScreen'); }}>
            <Text className="text-white text-lg mb-3">Atributos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { onClose(); onNavigate('ExperienceScreen'); }}>
            <Text className="text-white text-lg mb-3">Experiência</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
