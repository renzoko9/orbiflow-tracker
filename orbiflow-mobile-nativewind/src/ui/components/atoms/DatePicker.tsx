import { useRef, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const selectedDate = new Date(value);

  const formattedDate = selectedDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleOpen = () => bottomSheetRef.current?.present();

  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(date.toISOString());
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <View className={`w-full ${className}`}>
      <TouchableOpacity
        className={`flex-row items-center border rounded-lg px-3 py-3 bg-background-light ${
          error ? "border-error-medium" : "border-primary-2"
        }`}
        onPress={handleOpen}
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

      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.background.light }}
      >
        <BottomSheetView className="pb-8 px-4">
          <RNDateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="es-PE"
            style={{ width: "100%" }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
