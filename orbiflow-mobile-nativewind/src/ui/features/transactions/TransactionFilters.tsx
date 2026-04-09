import { View } from "react-native";
import { Tag, CalendarDays } from "lucide-react-native";
import { SegmentedControl } from "@/src/ui/components/atoms";
import { SelectBottomSheet } from "@/src/ui/components/molecules";
import { BottomSheetView } from "@/src/ui/components/atoms/BottomSheet";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { CircleSelector } from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";
import { Category } from "@/src/core/dto/category.interface";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import { colors } from "@/src/ui/theme/colors";

type TypeFilter = "ALL" | CategoryType;

interface DateRangeOption {
  label: string;
  value: string;
}

const DATE_RANGES: DateRangeOption[] = [
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
  const categoryItems: CircleSelectorItem[] = [
    {
      id: 0,
      label: "Todas",
      icon: (() => {
        const AllIcon = getIconComponent("tag");
        return <AllIcon size={18} color={colors.inverse} />;
      })(),
      color: colors.primary[5],
    },
    ...categories.map((cat) => {
      const IconComp = getIconComponent(cat.icon);
      return {
        id: cat.id,
        label: cat.name,
        icon: <IconComp size={18} color={colors.inverse} />,
        color: cat.color,
      };
    }),
  ];

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
        className="border border-primary-2"
      />

      <View className="flex-row gap-2">
        <View className="flex-1">
          <SelectBottomSheet
            icon={Tag}
            label={
              selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name
                : undefined
            }
            placeholder="Categoría"
          >
            {(dismiss) => (
              <BottomSheetView className="pb-8 px-4">
                <CircleSelector
                  items={categoryItems}
                  selectedId={selectedCategoryId ?? 0}
                  onSelect={(id) => {
                    onCategoryChange(id === 0 ? null : id);
                    dismiss();
                  }}
                  layout="wrap"
                  className="justify-center py-6"
                />
              </BottomSheetView>
            )}
          </SelectBottomSheet>
        </View>

        <View className="flex-1">
          <SelectBottomSheet
            icon={CalendarDays}
            label={selectedDateLabel}
            placeholder="Fecha"
          >
            {(dismiss) => (
              <BottomSheetView className="pb-8 px-4">
                <SegmentedControl
                  options={DATE_RANGES.map((d) => ({
                    value: d.value,
                    label: d.label,
                  }))}
                  value={dateRange}
                  onChange={(val) => {
                    onDateRangeChange(val);
                    dismiss();
                  }}
                />
              </BottomSheetView>
            )}
          </SelectBottomSheet>
        </View>
      </View>
    </View>
  );
}

export type { TypeFilter };
