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
import {
  Input,
  Button,
  SegmentedControl,
  CircleSelector,
} from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";

type TransactionType = "expense" | "income";

const EXPENSE_CATEGORIES: CircleSelectorItem[] = [
  {
    id: 1,
    label: "Compras",
    icon: <ShoppingCart size={22} color={colors.inverse} />,
    color: colors.error.medium,
  },
  {
    id: 2,
    label: "Comida",
    icon: <UtensilsCrossed size={22} color={colors.inverse} />,
    color: colors.warning.medium,
  },
  {
    id: 3,
    label: "Transporte",
    icon: <Car size={22} color={colors.inverse} />,
    color: colors.brand,
  },
  {
    id: 4,
    label: "Salud",
    icon: <Heart size={22} color={colors.inverse} />,
    color: colors.accent,
  },
  {
    id: 5,
    label: "Ocio",
    icon: <Gamepad2 size={22} color={colors.inverse} />,
    color: colors.secondary.second.medium,
  },
  {
    id: 6,
    label: "Educación",
    icon: <GraduationCap size={22} color={colors.inverse} />,
    color: colors.primary[5],
  },
];

const INCOME_CATEGORIES: CircleSelectorItem[] = [
  {
    id: 7,
    label: "Sueldo",
    icon: <Briefcase size={22} color={colors.inverse} />,
    color: colors.success.medium,
  },
  {
    id: 8,
    label: "Inversión",
    icon: <TrendingUp size={22} color={colors.inverse} />,
    color: colors.brand,
  },
  {
    id: 9,
    label: "Regalo",
    icon: <Gift size={22} color={colors.inverse} />,
    color: colors.warning.medium,
  },
  {
    id: 10,
    label: "Otro",
    icon: <Landmark size={22} color={colors.inverse} />,
    color: colors.secondary.first.medium,
  },
];

export default function NuevoScreen() {
  const [type, setType] = useState<TransactionType>("expense");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  // const [note, setNote] = useState("");

  const router = useRouter();
  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const isExpense = type === "expense";

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-3 p-4">
          {/* Header con nav */}
          <View className="flex-row gap-2 items-center my-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <ArrowLeft size={24} color={colors.base} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-base-color flex-1 text-center">
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
          <View className="flex-col gap-1 items-center py-6">
            <Text className="text-base">Monto</Text>
            <View className="flex-row gap-1 items-center">
              <Text className="text-5xl font-semibold text-base-color">S/</Text>
              <TextInput
                className="text-5xl font-bold text-base-color text-center w-40"
                placeholder="0.00"
                placeholderTextColor={colors.disabled}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Categorías */}
          <View className="flex-col gap-4 mb-4">
            <Text className="text-base text-text-light">Categoría</Text>
            <CircleSelector
              items={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
              layout="scroll"
            />
          </View>

          {/* Descripción */}
          <View className="flex-col gap-2">
            <Text className="text-base text-text-light">Descripción</Text>
            <Input
              placeholder="Ej: Almuerzo en restaurante"
              value={description}
              onChangeText={setDescription}
            />
          </View>

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
          {/* <Button variant={isExpense ? "primary" : "primary"} size="lg">
            Guardar {isExpense ? "Gasto" : "Ingreso"}
          </Button> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
