import { View, Text } from "react-native";
import { Children, isValidElement, cloneElement, ReactNode } from "react";

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const lastIndex = items.length - 1;

  return (
    <View className="gap-2">
      {title && (
        <Text className="text-xs font-semibold uppercase tracking-wider text-subordinary px-1">
          {title}
        </Text>
      )}
      <View className="bg-white rounded-2xl overflow-hidden">
        {items.map((child, index) =>
          isValidElement(child)
            ? cloneElement(child as React.ReactElement<{ showBorder?: boolean }>, {
                showBorder: index !== lastIndex,
              })
            : child,
        )}
      </View>
    </View>
  );
}
