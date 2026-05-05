import { ReactNode, useEffect, useState } from "react";
import { Text, TouchableOpacity, Modal, Pressable } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoreVertical } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

export interface KebabMenuItem {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  variant?: "default" | "danger";
}

interface KebabMenuProps {
  items: KebabMenuItem[];
}

const ENTER_DURATION = 180;
const EXIT_DURATION = 140;

export function KebabMenu({ items }: KebabMenuProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  const backdrop = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const menuScale = useSharedValue(0.94);
  const menuTranslateY = useSharedValue(-6);

  useEffect(() => {
    if (open) {
      backdrop.value = withTiming(1, {
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.quad),
      });
      menuOpacity.value = withTiming(1, {
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.quad),
      });
      menuScale.value = withSpring(1, {
        damping: 18,
        stiffness: 240,
        mass: 0.6,
      });
      menuTranslateY.value = withSpring(0, {
        damping: 18,
        stiffness: 240,
        mass: 0.6,
      });
    }
  }, [open, backdrop, menuOpacity, menuScale, menuTranslateY]);

  const handleOpen = () => {
    setVisible(true);
    requestAnimationFrame(() => setOpen(true));
  };

  const close = (after?: () => void) => {
    backdrop.value = withTiming(0, {
      duration: EXIT_DURATION,
      easing: Easing.in(Easing.quad),
    });
    menuOpacity.value = withTiming(0, {
      duration: EXIT_DURATION,
      easing: Easing.in(Easing.quad),
    });
    menuScale.value = withTiming(0.94, {
      duration: EXIT_DURATION,
      easing: Easing.in(Easing.quad),
    });
    menuTranslateY.value = withTiming(
      -6,
      { duration: EXIT_DURATION, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(setOpen)(false);
          runOnJS(setVisible)(false);
          if (after) runOnJS(after)();
        }
      },
    );
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [
      { translateY: menuTranslateY.value },
      { scale: menuScale.value },
    ],
  }));

  return (
    <>
      <TouchableOpacity onPress={handleOpen} hitSlop={8}>
        <MoreVertical size={22} color={colors.base} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => close()}
      >
        <Animated.View
          style={[
            { flex: 1, backgroundColor: "rgba(0,0,0,0.18)" },
            backdropStyle,
          ]}
        >
          <Pressable className="flex-1" onPress={() => close()} />

          <Animated.View
            className="absolute right-3 rounded-xl bg-inverse min-w-[180px] overflow-hidden"
            style={[
              {
                top: insets.top + 52,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 8,
              },
              menuStyle,
            ]}
          >
            {items.map((item, idx) => {
              const isDanger = item.variant === "danger";
              const isLast = idx === items.length - 1;
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => close(item.onPress)}
                  activeOpacity={0.55}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    !isLast ? "border-b border-primary-1" : ""
                  }`}
                >
                  {item.icon}
                  <Text
                    className={`text-base ${
                      isDanger
                        ? "text-error-medium font-medium"
                        : "text-text-light"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}
