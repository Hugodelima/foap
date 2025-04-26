import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, Animated } from 'react-native';
import { PencilIcon, TrashIcon, ShoppingCartIcon } from 'react-native-heroicons/outline';

import filter from '../assets/images/mission/filter.png';
import axios from 'axios';
import { API_URL } from '@env';
import { getUserId } from './ProgressScreen';
import { useFetchStatusUser } from '../hooks/useFetchDataStatus';
import RewardModal from '../modal/RewardModal';
import ConfirmationModal from '../modal/ConfirmationModal';
import ModalFilter from '../hooks/modalFilterReward';

interface Reward {
    id: number;
    titulo: string;
    ouro: number;
    situacao: string;
}

export default function RewardSection() {
    const { userData, setUserData } = useFetchStatusUser();
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [filterStatus, setFilterStatus] = useState<string | null>('');
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isRewardModalVisible, setRewardModalVisible] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    const skeletonOpacity = useRef(new Animated.Value(0.3)).current;

    const animateSkeleton = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(skeletonOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(skeletonOpacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const SkeletonBox = ({ height, width, radius = 8, style = {} }) => (
        <Animated.View
            style={{
                backgroundColor: '#444',
                opacity: skeletonOpacity,
                height,
                width,
                borderRadius: radius,
                marginBottom: 10,
                ...style,
            }}
        />
    );

    useEffect(() => {
        animateSkeleton();
    }, []);

    useEffect(() => {
        fetchRewards();
        const interval = setInterval(() => {
            fetchRewards();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredRewards = filterStatus
        ? rewards.filter((reward) => reward.situacao === filterStatus)
        : rewards;

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const userId = await getUserId();
            const response = await axios.get(`${API_URL}/api/rewardapi/${userId}`);
            setRewards(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar recompensas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSelection = (status: string) => {
        setFilterStatus(status === 'todos' ? '' : status);
        setFilterModalVisible(false);
    };
    
    const handleOpenFilterModal = () => {
        setFilterModalVisible(true);
    };

    const openRewardModal = (reward = null) => {
        setSelectedReward(reward);
        setRewardModalVisible(true);
    };

    const confirmDelete = (action: () => void) => {
        setDeleteAction(() => action);
        setModalVisible(true);
    };

    const handleDeleteReward = (rewardId: number) => {
        confirmDelete(async () => {
            try {
                await axios.delete(`${API_URL}/api/rewardapi/delete/${rewardId}`);
                Alert.alert('Recompensa excluída com sucesso!');
                fetchRewards();
            } catch (error: any) {
                console.error('Erro ao excluir recompensa:', error);
                Alert.alert('Erro ao excluir recompensa', error.response?.data?.message || 'Erro ao tentar excluir.');
            }
        });
    };

    const handleBuyReward = async (rewardId: number, goldCost: number) => {
        try {
            const userId = await getUserId();
            if (userData?.ouro >= goldCost) {
                await axios.post(`${API_URL}/api/rewardapi/buy/${rewardId}`, { 
                    id_usuario: userId
                });
                
                setUserData({ ...userData, ouro: userData?.ouro - goldCost });
                Alert.alert('Compra realizada com sucesso!');
                fetchRewards();
            } else {
                Alert.alert('Saldo insuficiente de ouro!');
            }
        } catch (error: any) {
            console.error('Erro ao comprar recompensa:', error);
            Alert.alert('Erro ao comprar recompensa', error.response?.data?.message || 'Erro ao tentar comprar.');
        }
    };

    const executeDelete = () => {
        if (deleteAction) {
            deleteAction();
            setModalVisible(false);
        }
    };

    return (
        <View className='flex-1 bg-neutral-900'>
            <View className="flex items-end">
                {loading ? (
                    <SkeletonBox height={50} width={50} radius={25} style={{ marginTop: 16, marginRight: 16 }} />
                ) : (
                    <TouchableOpacity className='mt-4 mr-4 w-12 h-12 rounded-full' onPress={handleOpenFilterModal}>
                        <Image source={filter} style={{width: 50, height: 50}} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                className='mb-28'
                data={loading ? Array(5).fill({}) : filteredRewards}
                keyExtractor={(item, index) => loading ? `skeleton-${index}` : item.id.toString()}
                renderItem={({ item, index }) => (
                    loading ? (
                        <View className='p-4 border-b border-neutral-700'>
                            <SkeletonBox height={20} width={'80%'} />
                            <SkeletonBox height={20} width={'70%'} />
                            <SkeletonBox height={20} width={'60%'} />
                            
                            <View className='flex-row justify-between mt-4'>
                                <View className='flex-row'>
                                    <SkeletonBox height={30} width={30} radius={15} style={{ marginRight: 16 }} />
                                    <SkeletonBox height={30} width={30} radius={15} />
                                </View>
                                <SkeletonBox height={30} width={30} radius={15} />
                            </View>
                        </View>
                    ) : (
                        <View className='p-4 border-b border-neutral-700'>
                            <Text className='text-white font-vt323'>Titulo: {item.titulo}</Text>
                            <Text className='text-white font-vt323'>Status: {item.situacao}</Text>
                            <Text className='text-white font-vt323'>Ouro: {item.ouro}</Text>

                            {item.situacao !== 'comprada' && (
                                <View className='flex-row justify-between mt-2 mb-2'>
                                    <View className='flex-row'>
                                        <TouchableOpacity onPress={() => openRewardModal(item)} className="mr-4">
                                            <PencilIcon size={30} color="orange" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteReward(item.id)}>
                                            <TrashIcon size={30} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => handleBuyReward(item.id, item.ouro)}>
                                            <ShoppingCartIcon size={30} color="green" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )
                )}
                ListEmptyComponent={
                    !loading && filteredRewards.length === 0 ? (
                    <View className="p-4 items-center">
                        <Text className="text-white">Nenhuma recompensa encontrada</Text>
                    </View>
                    ) : null
                }
            />

            {loading ? (
                <SkeletonBox
                    height={50}
                    width={'90%'}
                    radius={25}
                    style={{
                        position: 'absolute',
                        bottom: 16,
                        left: 20,
                        right: 20,
                    }}
                />
            ) : (
                <TouchableOpacity 
                    onPress={() => openRewardModal()} 
                    className="bg-cyan-500 rounded-full p-3 absolute bottom-4 right-5 left-5">
                    <Text className="text-white text-center font-vt323">Criar Nova Recompensa</Text>
                </TouchableOpacity>
            )}
            
            <RewardModal
                visible={isRewardModalVisible}
                onClose={() => setRewardModalVisible(false)}
                onSave={fetchRewards}
                reward={selectedReward}
            />

            <ConfirmationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={executeDelete}
                message="Tem certeza que deseja excluir este item?"
            />

            <ModalFilter
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onFilter={handleFilterSelection}
            />
        </View>
    );
}