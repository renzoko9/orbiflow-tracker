import { Platform, View, Text, TouchableOpacity, Modal } from "react-native";
import { useState } from "react";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface DatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  error,
  className = "",
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(value));

  const selectedDate = new Date(value);

  const formattedDate = selectedDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setShow(false);
    if (event.type === "set" && date) {
      onChange(date.toISOString());
    }
  };

  const handleIOSChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) setTempDate(date);
  };

  const handleIOSConfirm = () => {
    onChange(tempDate.toISOString());
    setShow(false);
  };

  return (
    <View className={`w-full ${className}`}>
      <TouchableOpacity
        className={`flex-row items-center border rounded-lg px-3 py-3 bg-background-light ${
          error ? "border-error-medium" : "border-primary-2"
        }`}
        onPress={() => {
          setTempDate(selectedDate);
          setShow(true);
        }}
        activeOpacity={0.7}
      >
        <CalendarDays
          size={20}
          color={error ? colors.error.medium : colors.subordinary}
        />
        <Text
          className={`ml-2 text-base capitalize ${
            error ? "text-error-medium" : "text-subordinary"
          }`}
        >
          {formattedDate}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text className="text-sm text-error-medium mt-1">{error}</Text>
      )}

      {/* Android: diálogo nativo */}
      {Platform.OS === "android" && show && (
        <RNDateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: modal con spinner */}
      {Platform.OS === "ios" && (
        <Modal visible={show} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-background-light rounded-t-2xl p-4">
              <View className="flex-row justify-between items-center mb-2">
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-base text-error-medium font-medium">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text className="text-base text-primary-6 font-semibold">
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleIOSChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="es-PE"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
