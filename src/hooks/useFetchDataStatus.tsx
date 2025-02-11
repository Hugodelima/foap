import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

import { API_URL } from "@env";

export function useFetchStatusUser() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchUserData() {
    try {
      const userID = await SecureStore.getItemAsync('userStorageID');
      
      if (userID) {
        const response = await axios.get(`${API_URL}/api/statusapi/${userID}`);
        setUserData(response.data);
      } else {
        setError('ID do usuário não encontrado.');
      }
    } catch (err) {
      setError('Erro ao buscar dados do usuário.');
      console.error(err);
    }
  }
  useEffect(() =>{
    fetchUserData()
    const interval = setInterval(() => {
      fetchUserData()
    }, 10000)
    return () => clearInterval(interval);
    
  },[]);
  

  return { userData, setUserData, error };
}
