import React from 'react';
import { Modal, Pressable, View, Text, TouchableOpacity } from 'react-native';

interface ModalFilterMissionProps {
  visible: boolean;
  onClose: () => void;
  onFilter: (status: string) => void;
}

export default function ModalFilterMission({ visible, onClose, onFilter }: ModalFilterMissionProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60">
        <Pressable className="w-90 bg-neutral-800 p-6 rounded-xl" onPress={() => {}}>
          <Text className="text-white text-2xl font-semibold mb-6 font-vt323">Filtrar Missões</Text>

          <TouchableOpacity onPress={() => onFilter('Finalizada')} className="py-3 bg-blue-400 rounded-xl mb-4">
            <Text className="font-semibold text-center text-white font-vt323">Finalizadas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('Em progresso')} className="py-3 bg-blue-400 rounded-xl mb-4">
            <Text className="font-semibold text-center text-white font-vt323">Em Progresso</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('Não finalizada')} className="py-3 bg-blue-400 rounded-xl mb-4">
            <Text className="font-semibold text-center text-white font-vt323">Não Finalizadas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onFilter('todos')} className="py-3 bg-blue-400 rounded-xl mb-4">
            <Text className="font-semibold text-center text-white font-vt323">Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-600 text-lg text-center mt-2">Fechar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
