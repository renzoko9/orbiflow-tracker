import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export interface CircleSelectorItem {
  id: number;
  label: string;
  icon: React.ReactNode;
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
  trailingAction?: React.ReactNode;
}

export function CircleSelector({
  items,
  selectedId,
  onSelect,
  layout = "wrap",
  circleSize = 56,
  itemWidth = 72,
  className = "",
  trailingAction,
}: CircleSelectorProps) {
  const content = items.map((item) => {
    const isSelected = selectedId === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item.id)}
        className="items-center"
        style={{ width: itemWidth }}
      >
        <View
          className={`rounded-full items-center justify-center ${
            item.label ? "mb-1" : ""
          } ${isSelected ? "border-2 border-primary-5" : ""}`}
          style={{
            width: circleSize,
            height: circleSize,
            backgroundColor: item.color,
            opacity: isSelected ? 1 : 0.5,
          }}
        >
          {item.icon}
        </View>
        {item.label ? (
          <Text
            className={`text-xs text-center ${
              isSelected ? "text-primary-6 font-semibold" : "text-text-light"
            }`}
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
        contentContainerClassName={`flex-row gap-4 ${className}`}
      >
        {content}
        {trailingAction}
      </ScrollView>
    );
  }

  return (
    <View className={`flex-row flex-wrap gap-4 ${className}`}>
      {content}
      {trailingAction}
    </View>
  );
}
