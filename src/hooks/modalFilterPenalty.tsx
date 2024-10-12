import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';

interface ModalPenaltyProps {
  visible: boolean;
  onClose: () => void;
  onFilter: (status: string) => void;
}

export default function ModalFilterPenalty({ visible, onClose, onFilter }: ModalPenaltyProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6">Filtrar Penalidades</Text>

          <TouchableOpacity onPress={() => onFilter('não_feita')} className='py-3 bg-yellow-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente Não Feitas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('Em progresso')} className='py-3 bg-blue-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente Em Progresso</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('superada')} className='py-3 bg-green-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente Superadas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('missao_feita')} className='py-3 bg-gray-400 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Somente Missões Feitas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('todos')} className='py-3 bg-gray-600 rounded-xl mb-4'>
            <Text className='font-bold text-center text-white'>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
