import { useState } from "react";
import { Platform } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatDate } from "@/shared/i18n";
import { SelectField } from "./SelectField";

interface DateFieldProps {
  /** ISO string */
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DateField({
  value,
  onChange,
  error,
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const tokens = useThemeTokens();
  const [open, setOpen] = useState(false);

  const date = value ? new Date(value) : new Date();

  function handleChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setOpen(false);
    if (selected) onChange(selected.toISOString());
  }

  return (
    <>
      <SelectField
        icon={<Calendar size={18} color={tokens.textTertiary} />}
        label={value ? formatDate(date) : undefined}
        placeholder="Selecciona una fecha"
        error={error}
        onPress={() => setOpen(true)}
      />
      {open ? (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
}
