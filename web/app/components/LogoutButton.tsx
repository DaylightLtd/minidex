"use client";

import {
  Alert,
  Button,
  ButtonProps,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api-client";

type LogoutButtonProps = ButtonProps & {
  redirectTo?: string;
};

export function LogoutButton({
  redirectTo = "/login",
  children,
  ...buttonProps
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoading(true);
    setError(null);

    try {
      await api.post<{ success: boolean }>("/auth/logout");
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        {...buttonProps}
        onClick={handleLogout}
        disabled={isLoading || buttonProps.disabled}
        startIcon={
          isLoading ? <CircularProgress size={16} /> : buttonProps.startIcon
        }
      >
        {children ?? "Logout"}
      </Button>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LogoutButton;
