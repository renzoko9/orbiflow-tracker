import { useRef, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatDate } from "@/shared/i18n";
import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetModal,
} from "./BottomSheet";
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
  const sheetRef = useRef<BottomSheetModal>(null);
  const [androidOpen, setAndroidOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const date = value ? new Date(value) : new Date();

  function openPicker() {
    if (Platform.OS === "ios") {
      setTempDate(date);
      sheetRef.current?.present();
    } else {
      setAndroidOpen(true);
    }
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    setAndroidOpen(false);
    if (event.type === "set" && selected) {
      onChange(selected.toISOString());
    }
  }

  function handleIosChange(_: DateTimePickerEvent, selected?: Date) {
    if (selected) setTempDate(selected);
  }

  function confirmIos() {
    if (tempDate) onChange(tempDate.toISOString());
    sheetRef.current?.dismiss();
  }

  function cancelIos() {
    sheetRef.current?.dismiss();
  }

  return (
    <>
      <SelectField
        icon={<Calendar size={18} color={tokens.textTertiary} />}
        label={value ? formatDate(date) : undefined}
        placeholder="Selecciona una fecha"
        error={error}
        onPress={openPicker}
      />

      {Platform.OS === "android" && androidOpen ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <BottomSheet ref={sheetRef} snapPoints={["50%"]}>
          <BottomSheetView className="pb-6">
            <View className="px-5 pt-2">
              <Text
                className="text-[10px] font-sans-bold uppercase text-textTertiary"
                style={{ letterSpacing: 0.5 }}
              >
                Seleccionar
              </Text>
              <Text className="text-2xl font-sans-extrabold text-textPrimary mt-1 mb-3">
                Fecha
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-5 pb-3 border-b border-border">
              <TouchableOpacity onPress={cancelIos} hitSlop={8}>
                <Text className="text-base text-textSecondary">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmIos} hitSlop={8}>
                <Text className="text-base font-sans-semibold text-brand">
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
              <DateTimePicker
                value={tempDate ?? date}
                mode="date"
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={handleIosChange}
                themeVariant="light"
                locale="es-PE"
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      ) : null}
    </>
  );
}
