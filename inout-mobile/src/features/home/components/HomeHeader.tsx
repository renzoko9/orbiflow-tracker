import { useMemo } from "react";
import { Text, View } from "react-native";
import { formatWeekdayShort } from "@/shared/i18n";

interface HomeHeaderProps {
  userName: string;
  monthlyNet?: number;
}

function getStatusLine(net: number | undefined): string {
  if (net === undefined) return "todo en orden";
  if (net > 0) return "vas bien este mes";
  if (net < 0) return "ojo con los gastos";
  return "todo en orden";
}

export function HomeHeader({ userName, monthlyNet }: HomeHeaderProps) {
  const today = useMemo(() => formatWeekdayShort(new Date()), []);
  const status = getStatusLine(monthlyNet);

  return (
    <View className="px-5 pt-6 pb-6">
      <Text
        className="text-[11px] font-sans-bold uppercase text-textDisabled mb-1"
        style={{ letterSpacing: 0.4 }}
      >
        Resumen
      </Text>
      <Text className="text-3xl font-sans-extrabold text-textPrimary">
        Hola, {userName}
      </Text>
    </View>
  );
}
