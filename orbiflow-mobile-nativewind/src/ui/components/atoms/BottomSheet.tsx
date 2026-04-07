import { forwardRef, useCallback, ReactNode } from "react";
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  BottomSheetFlatList,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/src/ui/theme/colors";

interface BottomSheetProps
  extends Omit<BottomSheetModalProps, "children" | "ref"> {
  children: ReactNode;
}

const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  ({ children, backdropComponent, ...rest }, ref) => {
    const defaultBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        backdropComponent={backdropComponent ?? defaultBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.background.light }}
        {...rest}
      >
        {children}
      </BottomSheetModal>
    );
  },
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet, BottomSheetView, BottomSheetFlatList, BottomSheetScrollView };
export type { BottomSheetModal };
