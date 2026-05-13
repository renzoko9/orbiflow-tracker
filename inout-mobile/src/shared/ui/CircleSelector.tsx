import { type ReactNode } from "react";
import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { cn } from "@/shared/utils";

export interface CircleSelectorItem {
  id: number;
  label: string;
  icon: ReactNode;
  color: string;
}

interface CircleSelectorProps {
  items: CircleSelectorItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  layout?: "scroll" | "wrap";
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
  const content = items.map((item) => {
    const selected = selectedId === item.id;
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
          {item.icon}
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
