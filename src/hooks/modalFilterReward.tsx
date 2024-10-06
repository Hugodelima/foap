import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';

interface ModalFilterProps {
  visible: boolean;
  onClose: () => void;
  onFilter: (status: string) => void;
}

export default function ModalFilter({ visible, onClose, onFilter }: ModalFilterProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">Filtrar Recompensas</Text>

          <TouchableOpacity onPress={() => onFilter('em aberto')} className='py-3 bg-blue-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente em Aberto</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('comprada')} className='py-3 bg-green-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente Comprado</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('todos')} className='py-3 bg-gray-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
