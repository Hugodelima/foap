import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Welcome: undefined;
    Home: undefined;
    Login: undefined;
    SignUp: undefined;
};
  
export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
  