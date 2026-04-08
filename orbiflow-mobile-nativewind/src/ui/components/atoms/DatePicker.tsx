import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(date);
  };

  return (
    <RNDateTimePicker
      value={value}
      mode="date"
      display="spinner"
      onChange={handleChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      locale="es-PE"
      style={{ width: "100%" }}
    />
  );
}
