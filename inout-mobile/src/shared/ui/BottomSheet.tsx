import {
  forwardRef,
  useCallback,
  useMemo,
  type ForwardedRef,
  type ReactNode,
} from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { lightTokens } from "@/shared/theme";

interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
}

/**
 * Wrapper sobre @gorhom/bottom-sheet con defaults sensatos:
 * - Backdrop oscuro tap-to-dismiss
 * - Handle visible
 * - Snap "auto" si no se pasa nada
 */
export const BottomSheet = forwardRef(function BottomSheet(
  { children, snapPoints, enablePanDownToClose = true }: BottomSheetProps,
  ref: ForwardedRef<BottomSheetModal>,
) {
  const points = useMemo(() => snapPoints ?? ["50%"], [snapPoints]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      enablePanDownToClose={enablePanDownToClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: lightTokens.surface }}
      handleIndicatorStyle={{ backgroundColor: lightTokens.borderStrong }}
    >
      {children}
    </BottomSheetModal>
  );
});

export { BottomSheetView };
export type { BottomSheetModal };
