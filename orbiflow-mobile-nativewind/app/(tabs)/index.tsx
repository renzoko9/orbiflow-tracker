import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G } from "react-native-svg";
import {
  ShoppingCart,
  Utensils,
  Car,
  Clapperboard,
  Zap,
  MoreHorizontal,
} from "lucide-react-native";

const CATEGORIAS = [
  { nombre: "Alimentación", monto: 850, color: "#77a8a8", porcentaje: 35 },
  { nombre: "Transporte", monto: 420, color: "#8E8DBE", porcentaje: 17 },
  { nombre: "Entretenimiento", monto: 380, color: "#9B75C7", porcentaje: 16 },
  { nombre: "Servicios", monto: 350, color: "#D9A444", porcentaje: 14 },
  { nombre: "Compras", monto: 280, color: "#5f8686", porcentaje: 12 },
  { nombre: "Otros", monto: 150, color: "#a6a6a6", porcentaje: 6 },
];

const TRANSACCIONES = [
  {
    id: 1,
    descripcion: "Supermercado Wong",
    categoria: "Alimentación",
    monto: -125.5,
    fecha: "Hoy",
    icono: ShoppingCart,
    color: "#77a8a8",
  },
  {
    id: 2,
    descripcion: "Uber",
    categoria: "Transporte",
    monto: -18.9,
    fecha: "Hoy",
    icono: Car,
    color: "#8E8DBE",
  },
  {
    id: 3,
    descripcion: "Restaurante La Mar",
    categoria: "Alimentación",
    monto: -89.0,
    fecha: "Ayer",
    icono: Utensils,
    color: "#77a8a8",
  },
  {
    id: 4,
    descripcion: "Netflix",
    categoria: "Entretenimiento",
    monto: -44.9,
    fecha: "Ayer",
    icono: Clapperboard,
    color: "#9B75C7",
  },
  {
    id: 5,
    descripcion: "Luz del Sur",
    categoria: "Servicios",
    monto: -156.3,
    fecha: "12 Ene",
    icono: Zap,
    color: "#D9A444",
  },
];

function DonutChart() {
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;

  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {CATEGORIAS.map((cat, index) => {
            const strokeDasharray = `${(cat.porcentaje / 100) * circumference} ${circumference}`;
            const strokeDashoffset =
              -(accumulatedPercentage / 100) * circumference;
            accumulatedPercentage += cat.porcentaje;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={cat.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      </Svg>
      <View className="absolute items-center">
        <Text className="text-sm text-subordinary">Gastos del mes</Text>
        <Text className="text-2xl font-bold text-base">S/ 2,430</Text>
      </View>
    </View>
  );
}

function CategoriaLegend() {
  return (
    <View className="flex-row flex-wrap px-2 mt-4">
      {CATEGORIAS.map((cat, index) => (
        <View key={index} className="flex-row items-center w-1/2 mb-3 px-2">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: cat.color }}
          />
          <Text className="text-xs text-subordinary">{cat.nombre}</Text>
        </View>
      ))}
    </View>
  );
}

function TransaccionItem({
  transaccion,
}: {
  transaccion: (typeof TRANSACCIONES)[0];
}) {
  const Icono = transaccion.icono;

  return (
    <View className="flex-row items-center py-3 px-4 bg-white rounded-2xl mb-2">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${transaccion.color}20` }}
      >
        <Icono size={20} color={transaccion.color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium">{transaccion.descripcion}</Text>
        <Text className="text-xs text-subordinary">
          {transaccion.categoria}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-base font-semibold text-error">
          S/ {transaccion.monto.toFixed(2)}
        </Text>
        <Text className="text-xs text-subordinary">{transaccion.fecha}</Text>
      </View>
    </View>
  );
}

export default function InicioScreen() {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-4">
          {/* Header */}
          <View className="items-center">
            <Text className="text-subordinary text-sm">Balance total</Text>
            <Text className="text-3xl font-bold text-base">S/ 12,450.80</Text>
          </View>

          {/* Selector de mes */}
          <View className="p-4 rounded-2xl bg-white">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-semibold text-base">Desglose de gastos</Text>
              <Text className="text-base font-medium text-primary-6 bg-primary-1 px-4 py-1 rounded-full">
                Enero 2026
              </Text>
            </View>

            {/* Gráfico Donut */}
            <View className="py-4">
              <DonutChart />
            </View>

            {/* Leyenda de categorías */}
            <CategoriaLegend />
          </View>

          {/* Últimas transacciones */}
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-base">
              Últimas transacciones
            </Text>
            <MoreHorizontal size={20} color="#a6a6a6" />
          </View>

          <View className="flex flex-col">
            {TRANSACCIONES.map((transaccion) => (
              <TransaccionItem key={transaccion.id} transaccion={transaccion} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
