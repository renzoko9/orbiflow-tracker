import { View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { CategoryAggregate } from "./aggregate-transactions";

interface CategoryDonutChartProps {
  categories: CategoryAggregate[];
  totalExpenses: number;
}

const SIZE = 180;
const STROKE_WIDTH = 22;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CX = SIZE / 2;
const CY = SIZE / 2;

export function CategoryDonutChart({
  categories,
  totalExpenses,
}: CategoryDonutChartProps) {
  let accumulated = 0;

  return (
    <View>
      <View
        style={{ width: SIZE, height: SIZE, alignSelf: "center" }}
        className="relative"
      >
        <Svg width={SIZE} height={SIZE}>
          <G rotation={-90} originX={CX} originY={CY}>
            {categories.map((cat) => {
              const fraction = cat.amount / totalExpenses;
              const length = fraction * CIRCUMFERENCE;
              const dashArray = `${length} ${CIRCUMFERENCE - length}`;
              const dashOffset = -accumulated;
              accumulated += length;
              return (
                <Circle
                  key={cat.id}
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  stroke={cat.color}
                  strokeWidth={STROKE_WIDTH}
                  fill="transparent"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>

        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-xs text-subordinary">Gastado</Text>
          <Text className="text-xl font-bold text-text-light mt-0.5">
            S/ {totalExpenses.toFixed(2)}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2">
        {categories.map((cat) => {
          const percentage = (cat.amount / totalExpenses) * 100;
          return (
            <View key={cat.id} className="flex-row items-center gap-3">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <Text
                className="flex-1 text-sm text-text-light"
                numberOfLines={1}
              >
                {cat.name}
              </Text>
              <Text className="text-xs text-subordinary mr-3">
                {percentage.toFixed(0)}%
              </Text>
              <Text className="text-sm font-semibold text-text-light">
                S/ {cat.amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
