import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

interface CodeFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  length?: number;
  autoFocus?: boolean;
}

/**
 * Input de codigo OTP integrado con react-hook-form.
 * Muestra una casilla por digito; un TextInput transparente captura la
 * entrada (borrado y pegado incluidos) limitada a digitos y a `length`.
 */
export function CodeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  length = 6,
  autoFocus,
}: CodeFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState }) => (
        <CodeCells
          value={value === undefined || value === null ? "" : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={fieldState.error?.message}
          label={label}
          length={length}
          autoFocus={autoFocus}
        />
      )}
    />
  );
}

interface CodeCellsProps {
  value: string;
  onChangeText: (value: string) => void;
  onBlur: () => void;
  error?: string;
  label?: string;
  length: number;
  autoFocus?: boolean;
}

function CodeCells({
  value,
  onChangeText,
  onBlur,
  error,
  label,
  length,
  autoFocus,
}: CodeCellsProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  function handleChange(raw: string) {
    onChangeText(raw.replace(/\D/g, "").slice(0, length));
  }

  function focusInput() {
    const input = inputRef.current;
    if (!input) return;
    // Si el teclado se cerro con el boton atras, el input sigue "enfocado"
    // y focus() no reabre el IME. Forzamos blur + focus para reabrirlo.
    if (input.isFocused()) {
      input.blur();
      requestAnimationFrame(() => input.focus());
    } else {
      input.focus();
    }
  }

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-medium text-textSecondary mb-2">
          {label}
        </Text>
      ) : null}

      <Pressable className="relative" onPress={focusInput}>
        <View className="flex-row gap-2">
          {Array.from({ length }).map((_, i) => {
            const char = value[i] ?? "";
            const isActive = focused && i === value.length;
            const highlight = !error && (isActive || char !== "");
            return (
              <View
                key={i}
                className={`flex-1 h-14 rounded-xl bg-surface items-center justify-center border ${
                  error
                    ? "border-danger"
                    : highlight
                      ? "border-brand"
                      : "border-border"
                } ${isActive ? "border-2" : ""}`}
              >
                <Text className="text-2xl font-bold text-textPrimary">
                  {char}
                </Text>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          caretHidden
          textContentType="oneTimeCode"
          pointerEvents="none"
          className="absolute inset-0 opacity-0 text-textPrimary"
        />
      </Pressable>

      {error ? (
        <Text className="text-[14px] text-danger mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
