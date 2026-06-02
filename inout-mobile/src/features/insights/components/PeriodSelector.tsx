import { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetScrollView,
  type BottomSheetModal,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatMonthName } from "@/shared/i18n";
import { cn } from "@/shared/utils";

interface PeriodSelectorProps {
  year: number;
  /** null = vista anual */
  month: number | null;
  availableYears: number[];
  onChange: (year: number, month: number | null) => void;
}

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function periodLabel(year: number, month: number | null): string {
  if (!month) return `${year}`;
  const name = formatMonthName(new Date(year, month - 1, 1));
  return `${name} ${year}`;
}

export function PeriodSelector({
  year,
  month,
  availableYears,
  onChange,
}: PeriodSelectorProps) {
  const tokens = useThemeTokens();
  const sheet = useRef<BottomSheetModal>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Comparable: el periodo seleccionado no puede ir al futuro.
  const isFutureMonth = (y: number, m: number) =>
    y > currentYear || (y === currentYear && m > currentMonth);

  const canGoNext = month
    ? isFutureMonthStep(year, month, currentYear, currentMonth)
    : year < currentYear;

  const step = (dir: -1 | 1) => {
    if (month) {
      const d = new Date(year, month - 1 + dir, 1);
      const ny = d.getFullYear();
      const nm = d.getMonth() + 1;
      if (dir === 1 && isFutureMonth(ny, nm)) return;
      onChange(ny, nm);
    } else {
      const ny = year + dir;
      if (dir === 1 && ny > currentYear) return;
      onChange(ny, null);
    }
  };

  const applyYear = (y: number) => {
    let m = month;
    if (m && isFutureMonth(y, m)) m = currentMonth;
    onChange(y, m);
  };

  return (
    <View>
      <View className="flex-row items-center justify-between bg-surface rounded-2xl border border-border px-2 py-1.5">
        <TouchableOpacity
          onPress={() => step(-1)}
          activeOpacity={0.7}
          className="w-10 h-10 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Periodo anterior"
        >
          <ChevronLeft size={22} color={tokens.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sheet.current?.present()}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 px-3 py-1.5"
          accessibilityRole="button"
          accessibilityLabel="Elegir periodo"
        >
          <Text className="text-base font-sans-bold text-textPrimary">
            {periodLabel(year, month)}
          </Text>
          <ChevronDown size={16} color={tokens.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => step(1)}
          disabled={!canGoNext}
          activeOpacity={0.7}
          className="w-10 h-10 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Periodo siguiente"
          accessibilityState={{ disabled: !canGoNext }}
        >
          <ChevronRight
            size={22}
            color={canGoNext ? tokens.textSecondary : tokens.textDisabled}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet ref={sheet} snapPoints={["55%"]}>
        <View className="px-5 pt-2">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 1.2 }}
          >
            Filtro
          </Text>
          <Text className="text-2xl font-sans-extrabold text-textPrimary mt-1 mb-3">
            Periodo
          </Text>
        </View>
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-5">
            <Text className="text-[11px] font-sans-bold uppercase text-textTertiary mb-2">
              Año
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {availableYears.map((y) => {
                const active = y === year;
                return (
                  <TouchableOpacity
                    key={y}
                    onPress={() => applyYear(y)}
                    activeOpacity={0.7}
                    className={cn(
                      "px-4 py-2 rounded-xl border",
                      active ? "bg-brand border-brand" : "bg-surface border-border",
                    )}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      className={cn(
                        "text-sm font-sans-semibold",
                        active ? "text-onBrand" : "text-textSecondary",
                      )}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-[11px] font-sans-bold uppercase text-textTertiary mb-2">
              Mes
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <MonthChip
                label="Año"
                active={month === null}
                disabled={false}
                onPress={() => {
                  onChange(year, null);
                  sheet.current?.dismiss();
                }}
              />
              {MONTHS_SHORT.map((label, i) => {
                const m = i + 1;
                const disabled = isFutureMonth(year, m);
                return (
                  <MonthChip
                    key={label}
                    label={label}
                    active={month === m}
                    disabled={disabled}
                    onPress={() => {
                      onChange(year, m);
                      sheet.current?.dismiss();
                    }}
                  />
                );
              })}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function MonthChip({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{ width: "22%" }}
      className={cn(
        "py-2.5 rounded-xl border items-center",
        active
          ? "bg-brand border-brand"
          : disabled
            ? "bg-surfaceMuted border-border"
            : "bg-surface border-border",
      )}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
    >
      <Text
        className={cn(
          "text-sm font-sans-semibold",
          active
            ? "text-onBrand"
            : disabled
              ? "text-textDisabled"
              : "text-textSecondary",
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** true si avanzar un mes desde (year, month) sigue dentro de hoy o antes. */
function isFutureMonthStep(
  year: number,
  month: number,
  currentYear: number,
  currentMonth: number,
): boolean {
  const d = new Date(year, month, 1);
  const ny = d.getFullYear();
  const nm = d.getMonth() + 1;
  return !(ny > currentYear || (ny === currentYear && nm > currentMonth));
}
