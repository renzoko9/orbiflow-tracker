import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { X } from "lucide-react-native";

interface ImageViewerProps {
  uri: string | null;
  onClose: () => void;
}

const MAX_SCALE = 4;
const MIN_SCALE = 1;

export function ImageViewer({ uri, onClose }: ImageViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransforms = () => {
    "worklet";
    scale.value = withTiming(1, { duration: 180 });
    savedScale.value = 1;
    translateX.value = withTiming(0, { duration: 180 });
    savedTranslateX.value = 0;
    translateY.value = withTiming(0, { duration: 180 });
    savedTranslateY.value = 0;
  };

  const handleClose = () => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    savedTranslateX.value = 0;
    translateY.value = 0;
    savedTranslateY.value = 0;
    onClose();
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.max(MIN_SCALE, Math.min(next, MAX_SCALE));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.02) {
        resetTransforms();
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetTransforms();
      } else {
        scale.value = withTiming(2.5, { duration: 180 });
        savedScale.value = 2.5;
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      if (scale.value <= 1.02) {
        runOnJS(handleClose)();
      }
    });

  const tapGroup = Gesture.Exclusive(doubleTap, singleTap);
  const gesture = Gesture.Simultaneous(pinch, pan, tapGroup);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        {uri && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[StyleSheet.absoluteFill, { backgroundColor: "black" }]}
          >
            <GestureDetector gesture={gesture}>
              <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <Image
                  source={{ uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="contain"
                />
              </Animated.View>
            </GestureDetector>

            <SafeAreaView
              edges={["top", "right"]}
              style={{ position: "absolute", top: 0, right: 0 }}
            >
              <Pressable onPress={handleClose} hitSlop={12}>
                <View
                  className="items-center justify-center rounded-full m-3"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                >
                  <X size={22} color="white" strokeWidth={2.4} />
                </View>
              </Pressable>
            </SafeAreaView>
          </Animated.View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}
