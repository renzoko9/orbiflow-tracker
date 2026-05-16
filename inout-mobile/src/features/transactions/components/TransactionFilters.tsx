import { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  CalendarDays,
  CalendarRange,
  ChevronsLeft,
  History,
  Sun,
  Tag,
  type LucideIcon,
} from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetScrollView,
  IconSelector,
  SegmentedControl,
  SelectField,
  type BottomSheetModal,
  type IconSelectorItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { cn, getIconComponent } from "@/shared/utils";
import { CategoryType, type Category } from "@/features/categories";

export type TypeFilter = "ALL" | CategoryType;

interface DateRangeOption {
  label: string;
  value: string;
  Icon: LucideIcon;
}

export const DATE_RANGES: DateRangeOption[] = [
  { label: "Todo", value: "all", Icon: History },
  { label: "Hoy", value: "today", Icon: Sun },
  { label: "Esta semana", value: "week", Icon: CalendarRange },
  { label: "Este mes", value: "month", Icon: CalendarDays },
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

  const selectedDate =
    DATE_RANGES.find((d) => d.value === dateRange) ?? DATE_RANGES[0]!;
  const SelectedDateIcon = selectedDate.Icon;
  const dateIsActive = dateRange !== "all";

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
            icon={
              <SelectedDateIcon
                size={18}
                color={dateIsActive ? tokens.brand : tokens.textTertiary}
              />
            }
            label={selectedDate.label}
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

      <BottomSheet ref={dateSheet} snapPoints={["50%"]}>
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
            {DATE_RANGES.map((opt, index) => {
              const selected = dateRange === opt.value;
              const Icon = opt.Icon;
              return (
                <View key={opt.value}>
                  {index > 0 ? <View className="h-px bg-border" /> : null}
                  <TouchableOpacity
                    onPress={() => {
                      onDateRangeChange(opt.value);
                      dateSheet.current?.dismiss();
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-3 py-3"
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: tokens.brand + "1F" }}
                    >
                      <Icon size={22} color={tokens.brand} />
                    </View>
                    <Text
                      className={cn(
                        "flex-1 text-base",
                        selected
                          ? "font-sans-bold text-brand"
                          : "font-sans-medium text-textPrimary",
                      )}
                    >
                      {opt.label}
                    </Text>
                    {selected ? (
                      <ChevronsLeft size={20} color={tokens.brand} />
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
