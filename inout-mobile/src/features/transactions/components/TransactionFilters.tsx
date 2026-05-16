import { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CalendarDays, Tag } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetScrollView,
  BottomSheetView,
  IconSelector,
  SegmentedControl,
  SelectField,
  type BottomSheetModal,
  type IconSelectorItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { getIconComponent } from "@/shared/utils";
import { CategoryType, type Category } from "@/features/categories";

export type TypeFilter = "ALL" | CategoryType;

interface DateRangeOption {
  label: string;
  value: string;
}

export const DATE_RANGES: DateRangeOption[] = [
  { label: "Todo", value: "all" },
  { label: "Hoy", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mes", value: "month" },
];

interface TransactionFiltersProps {
  typeFilter: TypeFilter;
  onTypeChange: (type: TypeFilter) => void;
  categories: Category[];
  selectedCategoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

export function TransactionFilters({
  typeFilter,
  onTypeChange,
  categories,
  selectedCategoryId,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
}: TransactionFiltersProps) {
  const tokens = useThemeTokens();
  const categorySheet = useRef<BottomSheetModal>(null);
  const dateSheet = useRef<BottomSheetModal>(null);

  const categoryItems: IconSelectorItem[] = [
    { id: 0, label: "Todas", iconName: "tag", color: tokens.brand },
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
      iconName: cat.icon,
      color: cat.color,
    })),
  ];

  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : undefined;
  const selectedCategoryLabel = selectedCategory?.name;
  const SelectedCategoryIcon = selectedCategory
    ? getIconComponent(selectedCategory.icon)
    : null;

  const selectedDateLabel =
    DATE_RANGES.find((d) => d.value === dateRange)?.label ?? "Todo";

  return (
    <View className="gap-3">
      <SegmentedControl
        options={[
          { value: "ALL", label: "Todos" },
          { value: String(CategoryType.EXPENSE), label: "Gastos" },
          { value: String(CategoryType.INCOME), label: "Ingresos" },
        ]}
        value={String(typeFilter)}
        onChange={(val) =>
          onTypeChange(val === "ALL" ? "ALL" : (Number(val) as CategoryType))
        }
      />

      <View className="flex-row gap-2">
        <View className="flex-1">
          <SelectField
            icon={
              SelectedCategoryIcon && selectedCategory ? (
                <SelectedCategoryIcon
                  size={18}
                  color={selectedCategory.color}
                />
              ) : (
                <Tag size={18} color={tokens.textTertiary} />
              )
            }
            label={selectedCategoryLabel}
            placeholder="Categoria"
            onPress={() => categorySheet.current?.present()}
          />
        </View>

        <View className="flex-1">
          <SelectField
            icon={<CalendarDays size={18} color={tokens.textTertiary} />}
            label={selectedDateLabel}
            placeholder="Fecha"
            onPress={() => dateSheet.current?.present()}
          />
        </View>
      </View>

      <BottomSheet ref={categorySheet} snapPoints={["70%"]}>
        <View className="px-5 pt-2">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 1.2 }}
          >
            Filtro
          </Text>
          <Text className="text-2xl font-sans-extrabold text-textPrimary mt-1 mb-3">
            Categoria
          </Text>
        </View>
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-5">
            <IconSelector
              items={categoryItems}
              selectedId={selectedCategoryId ?? 0}
              layout="list"
              onSelect={(id) => {
                onCategoryChange(id === 0 ? null : id);
                categorySheet.current?.dismiss();
              }}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet ref={dateSheet} snapPoints={["35%"]}>
        <BottomSheetView className="pb-8 px-4">
          <Text className="text-base font-semibold text-textPrimary py-3">
            Rango de fecha
          </Text>
          <View className="gap-2">
            {DATE_RANGES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onDateRangeChange(opt.value);
                  dateSheet.current?.dismiss();
                }}
                className={`rounded-xl px-4 py-3 border ${
                  dateRange === opt.value
                    ? "border-brand bg-brandSoft"
                    : "border-border bg-surface"
                }`}
              >
                <Text
                  className={
                    dateRange === opt.value
                      ? "text-brand font-semibold"
                      : "text-textPrimary"
                  }
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
