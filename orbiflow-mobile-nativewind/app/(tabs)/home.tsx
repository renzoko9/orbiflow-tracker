import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InicioScreen() {
  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900">Inicio</Text>
      </View>
    </SafeAreaView>
  );
}
