"use client";

import { ApiError } from "@/lib/api-client";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { queryKeys } from "@/lib/query-keys";

export type CurrentProfile = {
  id: string;
  userID: string;
  displayName?: string | null;
  avatarURL?: string | null;
};

const placeholderProfile: CurrentProfile = {
  id: "",
  userID: "",
  displayName: "User",
  avatarURL: null,
};

type UseCurrentProfileOptions = {
  enabled?: boolean;
};

export function useCurrentProfile(options?: UseCurrentProfileOptions) {
  const { enabled = true } = options ?? {};

  return useApiQuery<CurrentProfile>({
    queryKey: queryKeys.currentProfile,
    path: "/v1/me",
    request: { cache: "no-store" },
    enabled,
    placeholderData: placeholderProfile,
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        return placeholderProfile;
      }
      throw error;
    },
  });
}
