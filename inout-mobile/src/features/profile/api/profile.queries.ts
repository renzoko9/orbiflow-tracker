import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as profileApi from "./profile.api";
import { profileKeys } from "./profile.keys";
import type { UpdateProfileInput } from "../model";

export function useMe() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: profileApi.getMe,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.updateMe(input),
    onSuccess: (user) => {
      qc.setQueryData(profileKeys.me, user);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uri, mimeType }: { uri: string; mimeType: string }) =>
      profileApi.uploadAvatar(uri, mimeType),
    onSuccess: (user) => {
      qc.setQueryData(profileKeys.me, user);
    },
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileApi.deleteAvatar,
    onSuccess: (user) => {
      qc.setQueryData(profileKeys.me, user);
    },
  });
}
