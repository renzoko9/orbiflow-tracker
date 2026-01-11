import { View, Text, Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-primary-1">
      <Text className="text-4xl">Inicio</Text>
      <Pressable className="mt-4 px-4 py-2 bg-primary-5 rounded">
        <Text className="text-white">Botón de ejemplo</Text>
      </Pressable>
      <View className="mt-6 p-4 bg-secondary-first-soft rounded w-full">
        <Text className="text-lg font-semibold mb-2">
          Color secundario first
        </Text>
      </View>
      <View className="mt-6 p-4 bg-secondary-second-soft rounded w-full">
        <Text className="text-lg font-semibold mb-2">
          Color secundario second
        </Text>
      </View>
      <View className="mt-6 p-4 bg-secondary-third-soft rounded w-full">
        <Text className="text-lg font-semibold mb-2">
          Color secundario third
        </Text>
      </View>
    </View>
  );
}
