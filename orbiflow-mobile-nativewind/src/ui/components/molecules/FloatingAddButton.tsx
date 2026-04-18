import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";

export function FloatingAddButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/transactions/create")}
      className="items-center justify-center"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <View
        className="items-center justify-center rounded-full bg-primary-5"
        style={{
          width: 64,
          height: 64,
          shadowColor: "#476464",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Plus size={30} color="#fff" strokeWidth={2.6} />
      </View>
    </Pressable>
  );
}
