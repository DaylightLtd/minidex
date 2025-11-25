"use client";

import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { usersManagementMessages as m } from "@/app/(auth)/admin/users/messages";

export default function UsersManagementPage() {
  return (
    <Container maxWidth="md">
      <Stack spacing={3}>
        <Typography variant="h5">{m.title}</Typography>

        <Card>
          <CardContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" color="text.secondary">
                User management interface coming soon.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
