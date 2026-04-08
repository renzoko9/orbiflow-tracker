import { useRef, ReactNode } from "react";
import { SelectField } from "@/src/ui/components/atoms/SelectField";
import { BottomSheet } from "@/src/ui/components/atoms/BottomSheet";
import type { BottomSheetModal } from "@/src/ui/components/atoms/BottomSheet";
import type { LucideIcon } from "lucide-react-native";

interface SelectBottomSheetProps {
  icon: LucideIcon;
  label?: string;
  placeholder?: string;
  secondaryText?: string;
  error?: string;
  className?: string;
  children: ReactNode | ((dismiss: () => void) => ReactNode);
}

export function SelectBottomSheet({
  icon,
  label,
  placeholder,
  secondaryText,
  error,
  className,
  children,
}: SelectBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpen = () => bottomSheetRef.current?.present();
  const handleDismiss = () => bottomSheetRef.current?.dismiss();

  return (
    <>
      <SelectField
        icon={icon}
        label={label}
        placeholder={placeholder}
        secondaryText={secondaryText}
        onPress={handleOpen}
        error={error}
        className={className}
      />

      <BottomSheet ref={bottomSheetRef}>
        {typeof children === "function" ? children(handleDismiss) : children}
      </BottomSheet>
    </>
  );
}
