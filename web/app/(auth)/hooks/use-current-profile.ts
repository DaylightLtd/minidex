"use client";

import { useQuery } from "@tanstack/react-query";

import { apiQueryOptions } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export type CurrentProfile = {
  id: string;
  userID: string;
  displayName?: string | null;
  avatarURL?: string | null;
};

const currentProfileQuery = apiQueryOptions<CurrentProfile>({
  queryKey: queryKeys.currentProfile,
  path: "/v1/me",
  request: { cache: "no-store" },
});

type UseCurrentProfileOptions = {
  enabled?: boolean;
  placeholderData?: CurrentProfile;
};

export function useCurrentProfile(options?: UseCurrentProfileOptions) {
  const { enabled = true, placeholderData } = options ?? {};

  return useQuery<CurrentProfile>({
    ...currentProfileQuery,
    enabled,
    initialData: placeholderData,
  });
}
