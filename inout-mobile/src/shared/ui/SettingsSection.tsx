import { type ReactNode, Children, cloneElement, isValidElement } from "react";
import { View, Text } from "react-native";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const lastIdx = items.length - 1;

  return (
    <View className="gap-2">
      {title ? (
        <Text className="text-xs font-semibold text-textTertiary uppercase tracking-wide px-1">
          {title}
        </Text>
      ) : null}
      <View className="rounded-2xl bg-surface overflow-hidden">
        {items.map((child, idx) =>
          cloneElement(child as React.ReactElement<{ showBorder?: boolean }>, {
            showBorder: idx !== lastIdx,
            key: idx,
          }),
        )}
      </View>
    </View>
  );
}
