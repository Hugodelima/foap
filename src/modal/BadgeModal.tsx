import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { badgeIcons } from '../screensMain/BadgeScreen';

const BadgeModal = ({ visible, badge, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [badgesList, setBadgesList] = useState([]);

  useEffect(() => {
    if (visible) {
      // Se for um objeto único, transforma em array
      setBadgesList(Array.isArray(badge) ? badge : [badge]);
      setCurrentIndex(0);
    }
  }, [visible, badge]);

  if (!badgesList || badgesList.length === 0) return null;

  const currentBadge = badgesList[currentIndex];

  const handleNext = () => {
    if (currentIndex < badgesList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Fecha o modal ao exibir todas
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-neutral-800 p-5 rounded-lg w-80 items-center">
          <Image source={badgeIcons[currentBadge?.icone]} className="w-40 h-40 mb-4" />
          <Text className="text-white font-vt323 text-xl">{currentBadge.titulo}</Text>
          <Text className="text-gray-300 font-vt323 text-center mt-2">{currentBadge.descricao}</Text>

          <TouchableOpacity onPress={handleNext} className="mt-4 bg-blue-500 p-2 rounded-lg">
            <Text className="text-white font-vt323">
              {currentIndex < badgesList.length - 1 ? 'Próximo' : 'Fechar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BadgeModal;
