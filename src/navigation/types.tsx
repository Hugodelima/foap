import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    BottomNavigation: any;
    VerificationScreen: any;
    ResetPasswordScreen: any;
    FindUserScreen: any;
    VerificationForgotPassword: any;
    ChangeUserDataScreen: undefined;
    HelpStatusScreen: any;
    MainNavigation: any;
    AttributesScreen: undefined;
    ConfigurationScreen: undefined;
    ExperienceScreen: undefined;

};

export type UserBD = {
    data_criacao: string;
    email: string;
    id: number | null;
    nome_usuario: string;
    senha: string;
}

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

