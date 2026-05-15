import { type ReactNode } from "react";
import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { Check } from "lucide-react-native";
import { cn, getIconComponent } from "@/shared/utils";
import { useThemeTokens } from "@/shared/theme";

export interface CircleSelectorItem {
  id: number;
  label: string;
  iconName?: string;
  color: string;
}

interface CircleSelectorProps {
  items: CircleSelectorItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  layout?: "scroll" | "wrap" | "list";
  circleSize?: number;
  itemWidth?: number;
  className?: string;
  trailingAction?: ReactNode;
}

export function CircleSelector({
  items,
  selectedId,
  onSelect,
  layout = "wrap",
  circleSize = 56,
  itemWidth = 72,
  className,
  trailingAction,
}: CircleSelectorProps) {
  if (layout === "list") {
    return <ListLayout items={items} selectedId={selectedId} onSelect={onSelect} className={className} />;
  }

  const content = items.map((item) => {
    const selected = selectedId === item.id;
    const Icon = item.iconName ? getIconComponent(item.iconName) : null;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item.id)}
        className="items-center"
        style={{ width: itemWidth }}
        activeOpacity={0.7}
      >
        <View
          className={cn(
            "items-center justify-center rounded-full",
            item.label ? "mb-1" : "",
            selected && "border-2 border-brand",
          )}
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: item.color,
            opacity: selected ? 1 : 0.55,
          }}
        >
          {Icon ? <Icon size={Math.round(circleSize * 0.4)} color="#fff" /> : null}
        </View>
        {item.label ? (
          <Text
            className={cn(
              "text-xs text-center",
              selected ? "text-brand font-semibold" : "text-textPrimary",
            )}
          >
            {item.label}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  });

  if (layout === "scroll") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={cn("flex-row gap-4", className)}
      >
        {content}
        {trailingAction}
      </ScrollView>
    );
  }

  return (
    <View className={cn("flex-row flex-wrap gap-4", className)}>
      {content}
      {trailingAction}
    </View>
  );
}

interface ListLayoutProps {
  items: CircleSelectorItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  className?: string;
}

function ListLayout({ items, selectedId, onSelect, className }: ListLayoutProps) {
  const tokens = useThemeTokens();
  return (
    <View className={className}>
      {items.map((item, index) => {
        const selected = selectedId === item.id;
        const Icon = item.iconName ? getIconComponent(item.iconName) : null;
        return (
          <View key={item.id}>
            {index > 0 ? <View className="h-px bg-border ml-14" /> : null}
            <TouchableOpacity
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3"
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: item.color + "1F" }}
              >
                {Icon ? <Icon size={18} color={item.color} /> : null}
              </View>
              <Text
                className={cn(
                  "flex-1 text-base",
                  selected
                    ? "font-sans-bold text-brand"
                    : "font-sans-medium text-textPrimary",
                )}
              >
                {item.label}
              </Text>
              {selected ? <Check size={18} color={tokens.brand} /> : null}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
