import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/src/ui/theme/colors';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  keyboardType?: import("react-native").KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  error,
  leftIcon,
  rightIcon,
  className = '',
  keyboardType,
  autoCapitalize,
  multiline = false,
  numberOfLines,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const resolvedRightIcon = secureTextEntry
    ? (
      <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
        {showPassword
          ? <EyeOff size={20} color={colors.subordinary} />
          : <Eye size={20} color={colors.subordinary} />
        }
      </TouchableOpacity>
    )
    : rightIcon;

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
          ${error ? 'border-error-medium' : 'border-gray-300 focus:border-primary-6'}
          ${multiline ? 'py-2' : 'py-3'}
        `}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className="flex-1 text-base text-gray-900"
          placeholder={placeholder}
          placeholderTextColor={error ? colors.error.medium : colors.subordinary}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />

        {resolvedRightIcon && <View className="ml-2">{resolvedRightIcon}</View>}
      </View>

      {error && (
        <Text className="text-sm text-error-medium mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
