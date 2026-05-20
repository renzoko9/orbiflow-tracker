import { Redirect } from "expo-router";

export default function NewTabPlaceholder() {
  return <Redirect href="/(tabs)/home" />;
}
