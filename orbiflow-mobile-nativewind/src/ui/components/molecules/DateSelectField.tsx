import { CalendarDays } from "lucide-react-native";
import { DatePicker } from "@/src/ui/components/atoms/DatePicker";
import { BottomSheetView } from "@/src/ui/components/atoms/BottomSheet";
import { SelectBottomSheet } from "./SelectBottomSheet";

interface DateSelectFieldProps {
  value: string | Date;
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DateSelectField({
  value,
  onChange,
  error,
  className,
  minimumDate,
  maximumDate,
}: DateSelectFieldProps) {
  const selectedDate =
    value instanceof Date
      ? value
      : (() => {
        const [y, m, d] = value.split("T")[0].split("-").map(Number);
        return new Date(y, m - 1, d);  // medianoche local, no UTC
      })();

  const formattedDate = selectedDate.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleChange = (date: Date) => onChange(date.toISOString());

  return (
    <SelectBottomSheet
      icon={CalendarDays}
      label={formattedDate}
      error={error}
      className={className}
    >
      <BottomSheetView className="pb-8 px-4">
        <DatePicker
          value={selectedDate}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      </BottomSheetView>
    </SelectBottomSheet>
  );
}
