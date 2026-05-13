import { Pressable, View } from "react-native";
import { Plus } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

interface FloatingAddButtonProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Crear movimiento"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <View
        className="items-center justify-center rounded-full bg-brand"
        style={{
          width: 60,
          height: 60,
          shadowColor: tokens.brandStrong,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Plus size={28} color={tokens.onBrand} strokeWidth={2.6} />
      </View>
    </Pressable>
  );
}
