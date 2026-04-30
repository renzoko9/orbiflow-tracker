import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Pencil, Trash2 } from "lucide-react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";
import { TransactionItem } from "./TransactionItem";
import { TransactionListResponse } from "@/src/core/dto/transaction.interface";
import { useDeleteTransaction } from "@/src/ui/hooks";
import { showToast } from "@/src/ui/components/atoms";
import { colors } from "@/src/ui/theme/colors";

const BUTTON_WIDTH = 72;
const TOTAL_WIDTH = BUTTON_WIDTH * 2;

function RightActions({
  drag,
  onEdit,
  onDelete,
  isPending,
}: {
  drag: SharedValue<number>;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const editStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          drag.value,
          [-TOTAL_WIDTH, -BUTTON_WIDTH, 0],
          [0, BUTTON_WIDTH, TOTAL_WIDTH],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          drag.value,
          [-TOTAL_WIDTH, -BUTTON_WIDTH, 0],
          [0, 0, BUTTON_WIDTH],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View style={{ width: TOTAL_WIDTH, flexDirection: "row", overflow: "hidden" }}>
      <Animated.View style={[{ width: BUTTON_WIDTH }, editStyle]}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.primary[5],
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Pencil size={20} color="white" />
          <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>
            Editar
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[{ width: BUTTON_WIDTH }, deleteStyle]}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.error.medium,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onDelete}
          activeOpacity={0.8}
          disabled={isPending}
        >
          <Trash2 size={20} color="white" />
          <Text style={{ color: "white", fontSize: 12, marginTop: 4 }}>
            Eliminar
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

interface SwipeableTransactionItemProps {
  transaction: TransactionListResponse;
}

export function SwipeableTransactionItem({
  transaction,
}: SwipeableTransactionItemProps) {
  const router = useRouter();
  const swipeableRef = useRef<React.ElementRef<typeof ReanimatedSwipeable>>(null);
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction();

  const handleEdit = () => {
    swipeableRef.current?.close();
    router.push({
      pathname: "/transactions/[id]",
      params: { id: String(transaction.id) },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar movimiento",
      "Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            deleteTransaction(transaction.id, {
              onSuccess: () =>
                showToast({
                  type: "success",
                  text1: "Movimiento eliminado",
                  text2: "El movimiento se eliminó correctamente",
                }),
              onError: () =>
                showToast({
                  type: "error",
                  text1: "Error",
                  text2: "No se pudo eliminar el movimiento",
                }),
            }),
        },
      ],
    );
  };

  const renderRightActions = (
    _progress: SharedValue<number>,
    drag: SharedValue<number>,
  ) => (
    <RightActions
      drag={drag}
      onEdit={handleEdit}
      onDelete={handleDelete}
      isPending={isPending}
    />
  );

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      overshootRight={false}
      renderRightActions={renderRightActions}
    >
      <TransactionItem
        categoryName={transaction.category?.name ?? "Sin categoría"}
        categoryIcon={transaction.category?.icon ?? "tag"}
        categoryColor={transaction.category?.color ?? "#a6a6a6"}
        description={transaction.description}
        amount={transaction.amount}
        type={transaction.type}
      />
    </ReanimatedSwipeable>
  );
}
