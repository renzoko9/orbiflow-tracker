import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ShoppingCart,
  UtensilsCrossed,
  Car,
  Heart,
  Gamepad2,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Gift,
  Landmark,
  CalendarDays,
  ArrowLeft,
} from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Input, Button, SegmentedControl } from "@/src/ui/components/atoms";

type TransactionType = "expense" | "income";

interface MockCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const EXPENSE_CATEGORIES: MockCategory[] = [
  {
    id: "1",
    name: "Compras",
    icon: <ShoppingCart size={22} color={colors.inverse} />,
    color: colors.error.medium,
  },
  {
    id: "2",
    name: "Comida",
    icon: <UtensilsCrossed size={22} color={colors.inverse} />,
    color: colors.warning.medium,
  },
  {
    id: "3",
    name: "Transporte",
    icon: <Car size={22} color={colors.inverse} />,
    color: colors.brand,
  },
  {
    id: "4",
    name: "Salud",
    icon: <Heart size={22} color={colors.inverse} />,
    color: colors.accent,
  },
  {
    id: "5",
    name: "Ocio",
    icon: <Gamepad2 size={22} color={colors.inverse} />,
    color: colors.secondary.second.medium,
  },
  {
    id: "6",
    name: "Educación",
    icon: <GraduationCap size={22} color={colors.inverse} />,
    color: colors.primary[5],
  },
];

const INCOME_CATEGORIES: MockCategory[] = [
  {
    id: "7",
    name: "Sueldo",
    icon: <Briefcase size={22} color={colors.inverse} />,
    color: colors.success.medium,
  },
  {
    id: "8",
    name: "Inversión",
    icon: <TrendingUp size={22} color={colors.inverse} />,
    color: colors.brand,
  },
  {
    id: "9",
    name: "Regalo",
    icon: <Gift size={22} color={colors.inverse} />,
    color: colors.warning.medium,
  },
  {
    id: "10",
    name: "Otro",
    icon: <Landmark size={22} color={colors.inverse} />,
    color: colors.secondary.first.medium,
  },
];

export default function NuevoScreen() {
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // const [amount, setAmount] = useState("");
  // const [description, setDescription] = useState("");
  // const [note, setNote] = useState("");

  const router = useRouter();
  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isExpense = type === "expense";

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-8">
          {/* Header con nav */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <ArrowLeft size={24} color={colors.base} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-base-color flex-1 text-center mr-6">
              Nuevo Movimiento
            </Text>
          </View>

          {/* Switch Gasto / Ingreso */}
          <SegmentedControl
            options={[
              { value: "expense", label: "Gasto" },
              { value: "income", label: "Ingreso" },
            ]}
            value={type}
            onChange={(val) => {
              setType(val);
              setSelectedCategory(null);
            }}
            className="border border-primary-2"
          />

          {/* Monto */}
          {/* <View className="items-center mb-8">
            <Text className="text-sm text-subordinary mb-2">Monto</Text>
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-base-color mr-1">
                S/
              </Text>
              <TextInput
                className="text-3xl font-bold text-base-color min-w-[100px] text-center"
                placeholder="0.00"
                placeholderTextColor={colors.disabled}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View> */}

          {/* Categorías */}
          {/* <View className="mb-8">
            <Text className="text-sm font-medium text-text-light mb-3">
              Categoría
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    className="items-center"
                    style={{ width: 72 }}
                  >
                    <View
                      className={`w-14 h-14 rounded-full items-center justify-center mb-1 ${
                        isSelected ? "border-2 border-primary-6" : ""
                      }`}
                      style={{
                        backgroundColor: cat.color,
                        opacity: isSelected ? 1 : 0.7,
                      }}
                    >
                      {cat.icon}
                    </View>
                    <Text
                      className={`text-xs text-center ${
                        isSelected
                          ? "text-primary-6 font-semibold"
                          : "text-text-light"
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View> */}

          {/* Descripción */}
          {/* <Input
            label="Descripción"
            placeholder="Ej: Almuerzo en restaurante"
            value={description}
            onChangeText={setDescription}
            className="mb-5"
          /> */}

          {/* Fecha */}
          {/* <View className="mb-5">
            <Text className="text-sm font-medium text-text-light mb-2">
              Fecha
            </Text>
            <TouchableOpacity className="flex-row items-center border border-gray-300 rounded-lg px-3 py-3 bg-background-light">
              <CalendarDays size={20} color={colors.subordinary} />
              <Text className="text-base text-subordinary ml-2">
                Hoy, 1 de abril 2026
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Nota adicional */}
          {/* <Input
            label="Nota adicional"
            placeholder="Agrega una nota (opcional)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            className="mb-8"
          /> */}

          {/* Botón Guardar */}
          {/* <Button
            variant={isExpense ? "primary" : "primary"}
            size="lg"
            className={isExpense ? "bg-error-medium" : "bg-success-medium"}
          >
            Guardar {isExpense ? "Gasto" : "Ingreso"}
          </Button> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
