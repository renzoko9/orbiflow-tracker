import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import AuthService from "@/src/core/services/auth.service";
import StorageService from "@/src/core/storage/storage.service";
import { STORAGE_KEYS } from "@/src/core/config/environment.config";
import { UserResponse } from "@/src/core/dto/auth.interface";
import { useAuthStore } from "@/src/core/store";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function init() {
      const auth = await AuthService.isAuthenticated();

      if (auth) {
        const userData = await StorageService.getObject<UserResponse>(
          STORAGE_KEYS.userData,
        );
        if (userData) {
          useAuthStore.getState().setUser(userData);
        }
      }

      setIsAuthenticated(auth);
      setIsLoading(false);
    }

    init();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-inverse">
        <ActivityIndicator size="large" color="#77a8a8" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
