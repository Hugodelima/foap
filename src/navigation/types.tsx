import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    AppNavigation: undefined;
};
  
export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
  