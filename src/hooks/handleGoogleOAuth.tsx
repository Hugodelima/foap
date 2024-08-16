import * as WebBrowser from 'expo-web-browser';
import { useWarmUpBrowser } from '../hooks/warmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';

export const useHandleGoogleOAuth=()=>{
    
    WebBrowser.maybeCompleteAuthSession();
    useWarmUpBrowser();
    
    const {startOAuthFlow} = useOAuth({strategy: 'oauth_google'})
    
    const onPress=async() =>{
        try {
            const {createdSessionId,signIn, signUp, setActive} =
                await startOAuthFlow();
            if (createdSessionId && typeof setActive === 'function'){
                setActive({session:createdSessionId})
            } else{
                //signup
            }
            
        } catch (error) {
            console.error("Oauth erro",error)
        }
    };
    return {
        onPress,
    }
}
