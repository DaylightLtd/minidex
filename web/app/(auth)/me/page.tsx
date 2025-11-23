"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { useCurrentProfile, type CurrentProfile } from "@/app/(auth)/hooks/use-current-profile";
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import { queryKeys } from "@/lib/query-keys";

type ProfilePayload = {
  displayName?: string | null;
  avatarURL?: string | null;
};

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true; // Empty is valid (will be null)
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function ProfileEditPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile();

  const [displayName, setDisplayName] = useState("");
  const [avatarURL, setAvatarURL] = useState("");
  const [avatarUrlError, setAvatarUrlError] = useState<string | null>(null);

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setAvatarURL(profile.avatarURL ?? "");
    } else if (profile === null) {
      // Profile doesn't exist, start with empty form
      setDisplayName("");
      setAvatarURL("");
    }
  }, [profile]);

  const createMutation = useApiMutation<CurrentProfile, ProfilePayload>({
    method: "post",
    path: "/v1/me",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentProfile });
    },
  });

  const updateMutation = useApiMutation<CurrentProfile, ProfilePayload>({
    method: "patch",
    path: "/v1/me",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.currentProfile });
    },
  });

  const handleDisplayNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (createMutation.isError) createMutation.reset();
    if (updateMutation.isError) updateMutation.reset();
    setDisplayName(event.target.value);
  };

  const handleAvatarUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (createMutation.isError) createMutation.reset();
    if (updateMutation.isError) updateMutation.reset();
    const value = event.target.value;
    setAvatarURL(value);

    // Validate URL format
    if (value.trim() && !isValidUrl(value)) {
      setAvatarUrlError("Please enter a valid URL");
    } else {
      setAvatarUrlError(null);
    }
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ProfilePayload = {
      displayName: displayName.trim() || null,
      avatarURL: avatarURL.trim() || null,
    };

    // Choose mutation based on profile existence
    if (profile) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isFormDisabled = isProfileLoading || isSubmitting;
  const hasFormError = avatarUrlError !== null;

  if (isProfileLoading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Edit Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Update your display name and avatar URL.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Display Name"
                  value={displayName}
                  onChange={handleDisplayNameChange}
                  placeholder="Enter your display name"
                  fullWidth
                  disabled={isFormDisabled}
                  InputLabelProps={{ shrink: true, required: false }}
                />

                <TextField
                  label="Avatar URL"
                  value={avatarURL}
                  onChange={handleAvatarUrlChange}
                  placeholder="https://example.com/avatar.jpg"
                  fullWidth
                  disabled={isFormDisabled}
                  error={hasFormError}
                  helperText={avatarUrlError}
                  InputLabelProps={{ shrink: true, required: false }}
                />

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isFormDisabled || hasFormError}
                    fullWidth
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

