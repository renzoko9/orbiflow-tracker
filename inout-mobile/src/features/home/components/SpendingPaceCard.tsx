import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, TrendingUp } from "lucide-react-native";
import { SectionEyebrow } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency, getCurrentMonthName } from "@/shared/i18n";

interface SpendingPaceCardProps {
  spent: number;
  projected: number;
  daysElapsed: number;
  daysInMonth: number;
  onPress: () => void;
}

const tabular = { fontVariant: ["tabular-nums" as const] };
const eyebrow = { letterSpacing: 0.4 };

/**
 * Ritmo de gasto del mes en curso: cuanto va gastado, cuanto proyecta
 * gastar a fin de mes y en que punto del mes esta. Toda la seccion lleva
 * al tab de Insights.
 */
export function SpendingPaceCard({
  spent,
  projected,
  daysElapsed,
  daysInMonth,
  onPress,
}: SpendingPaceCardProps) {
  const tokens = useThemeTokens();
  const progress = Math.min((daysElapsed / daysInMonth) * 100, 100);

  const seeMore = (
    <View className="flex-row items-center">
      <Text className="text-[11px] font-sans-bold text-brandStrong uppercase">
        Ver insights
      </Text>
      <ChevronRight size={14} color={tokens.brandStrong} />
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Ver insights"
      className="-mt-5 rounded-2xl bg-brandSoft px-5 pt-9 pb-5"
    >
      <SectionEyebrow
        label={`Ritmo de gasto · ${getCurrentMonthName()}`}
        rightElement={seeMore}
      />

      <View className="flex-row">
        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={eyebrow}
          >
            Gastado
          </Text>
          <Text
            className="text-xl font-display-bold text-textPrimary mt-1"
            style={tabular}
          >
            {formatCurrency(spent)}
          </Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={eyebrow}
          >
            Proyectado a fin de mes
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <TrendingUp size={15} color={tokens.brandStrong} />
            <Text
              className="text-xl font-display-bold text-brandStrong"
              style={tabular}
            >
              {formatCurrency(projected)}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-2 rounded-full bg-surface overflow-hidden mt-5">
        <View
          className="h-full rounded-full bg-brandStrong"
          style={{ width: `${progress}%` }}
        />
      </View>
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-[11px] text-textTertiary" style={tabular}>
          Dia {daysElapsed} de {daysInMonth}
        </Text>
        <Text
          className="text-[11px] font-sans-semibold text-textSecondary"
          style={tabular}
        >
          {Math.round(progress)}% del mes
        </Text>
      </View>
    </TouchableOpacity>
  );
}
