import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input, type InputProps } from "./Input";

interface FormFieldProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, "value" | "onChangeText" | "onBlur" | "error"> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
}

/**
 * Input integrado con react-hook-form.
 * Convierte automaticamente el value a string para TextInput.
 */
export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState }) => (
        <Input
          value={value === undefined || value === null ? "" : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={fieldState.error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
