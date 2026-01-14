import { TextInput, View, Text } from 'react-native';
import { ReactNode } from 'react';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  leftIcon,
  rightIcon,
  className = '',
  multiline = false,
  numberOfLines,
}: InputProps) {
  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center border rounded-lg px-3 bg-white
          ${error ? 'border-error' : 'border-gray-300 focus:border-primary-6'}
          ${multiline ? 'py-2' : 'py-3'}
        `}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-base text-gray-900"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />

        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-sm text-error mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
