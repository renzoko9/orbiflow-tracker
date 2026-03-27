import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { KeyboardTypeOptions } from "react-native";
import { Input } from "@/src/ui/components/atoms";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
