import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useThemeTokens } from "@/shared/theme";

export function TypingBubble() {
  const tokens = useThemeTokens();
  return (
    <Animated.View
      className="self-start rounded-2xl bg-surface px-4 py-3 flex-row items-center gap-1.5"
      style={{
        borderTopLeftRadius: 4,
        borderWidth: 1,
        borderColor: tokens.border,
      }}
    >
      <Dot delay={0} />
      <Dot delay={160} />
      <Dot delay={320} />
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const tokens = useThemeTokens();
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380 }),
          withTiming(0.3, { duration: 380 }),
        ),
        -1,
      ),
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-2, { duration: 380 }),
          withTiming(0, { duration: 380 }),
        ),
        -1,
      ),
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: tokens.textTertiary,
        }}
      />
    </Animated.View>
  );
}
