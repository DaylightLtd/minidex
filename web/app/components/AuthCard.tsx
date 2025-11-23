"use client";

import { Container, ContainerProps, Paper } from "@mui/material";
import { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
  elevation?: number;
};

export function AuthCard({
  children,
  maxWidth = "xs",
  elevation = 3,
}: AuthCardProps) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper elevation={elevation} sx={{ p: { xs: 3, md: 4 }, width: "100%" }}>
        {children}
      </Paper>
    </Container>
  );
}
