declare module 'react-native-otp-input' {
  import { Component } from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

  interface OTPTextInputProps {
    inputCount: number;
    handleTextChange: (text: string) => void;
    textInputStyle?: TextStyle;
    tintColor?: string;
    offTintColor?: string;
    containerStyle?: ViewStyle;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    editable?: boolean;
  }

  export default class OTPTextInput extends Component<OTPTextInputProps> {}
}
