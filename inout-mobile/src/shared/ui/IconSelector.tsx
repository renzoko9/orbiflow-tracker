import { type ReactNode } from "react";
import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import { ChevronsLeft } from "lucide-react-native";
import { cn, getIconComponent } from "@/shared/utils";
import { useThemeTokens } from "@/shared/theme";

export interface IconSelectorItem {
  id: number;
  label: string;
  iconName?: string;
  color: string;
}

interface IconSelectorProps {
  items: IconSelectorItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  layout?: "scroll" | "wrap" | "list";
  tileSize?: number;
  itemWidth?: number;
  className?: string;
  trailingAction?: ReactNode;
}

export function IconSelector({
  items,
  selectedId,
  onSelect,
  layout = "wrap",
  tileSize = 56,
  itemWidth = 72,
  className,
  trailingAction,
}: IconSelectorProps) {
  if (layout === "list") {
    return (
      <ListLayout
        items={items}
        selectedId={selectedId}
        onSelect={onSelect}
        className={className}
      />
    );
  }

  const content = items.map((item) => {
    const selected = selectedId === item.id;
    const Icon = item.iconName ? getIconComponent(item.iconName) : null;
    const hasIcon = Boolean(Icon);
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
            "items-center justify-center",
            hasIcon ? "rounded-xl" : "rounded-full",
            item.label ? "mb-1" : "",
            selected && "border-2 border-brand",
          )}
          style={{
            width: tileSize,
            height: tileSize,
            backgroundColor: hasIcon ? item.color + "1F" : item.color,
            opacity: selected || !hasIcon ? 1 : 0.7,
          }}
        >
          {Icon ? <Icon size={Math.round(tileSize * 0.4)} color={item.color} /> : null}
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
  items: IconSelectorItem[];
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
            {index > 0 ? <View className="h-px bg-border" /> : null}
            <TouchableOpacity
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-3"
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center"
                style={{ backgroundColor: item.color + "1F" }}
              >
                {Icon ? <Icon size={22} color={item.color} /> : null}
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
              {selected ? (
                <ChevronsLeft size={20} color={tokens.brand} />
              ) : null}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
