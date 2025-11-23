"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError, apiQueryOptions } from "@/lib/api-client";
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

const currentProfileQuery = apiQueryOptions<CurrentProfile>({
  queryKey: queryKeys.currentProfile,
  path: "/v1/me",
  request: { cache: "no-store" },
  onError: (error) => {
    if (error instanceof ApiError && error.status === 404) {
      return placeholderProfile;
    }
    throw error;
  },
});

type UseCurrentProfileOptions = {
  enabled?: boolean;
  placeholderData?: CurrentProfile;
};

export function useCurrentProfile(options?: UseCurrentProfileOptions) {
  const { enabled = true } = options ?? {};

  return useQuery<CurrentProfile>({
    ...currentProfileQuery,
    enabled,
    initialData: placeholderProfile,
  });
}
