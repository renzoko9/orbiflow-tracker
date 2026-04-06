import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";

export function FloatingAddButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/new")}
      className="absolute -top-6 items-center justify-center w-14 h-14 bg-primary-5 rounded-full shadow-lg"
      style={{
        shadowColor: "#476464",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      <Plus size={28} color="#fff" strokeWidth={2.5} />
    </Pressable>
  );
}
