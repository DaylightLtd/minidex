'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from '@mui/material'

import LogoutButton from '@/app/components/LogoutButton'
import { api } from '@/lib/api-client'

type CurrentUser = {
  id: string
  displayName?: string | null
  roles: number
  isActive: boolean
}

async function fetchCurrentUser() {
  return api.get<CurrentUser>('/user', { cache: 'no-store' })
}

export default function DashboardPage() {
  const {
    data: user,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
  })

  const showLoading = isLoading && !error

  return (
    <Box
      sx={{
        maxWidth: 640,
        mx: 'auto',
        my: 8,
        px: 2,
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You are logged in to MiniDex. Use the navigation to access other sections.
          </Typography>
        </Box>

        {showLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load user information.
          </Alert>
        )}

        {user && (
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Welcome back{user.displayName ? `, ${user.displayName}` : ''}!
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  <strong>User ID:</strong> {user.id}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}
                </Typography>
                <Typography variant="body1">
                  <strong>Roles bitmask:</strong> {user.roles}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Box display="flex" justifyContent="flex-end">
          <LogoutButton variant="outlined" color="primary" disabled={isRefetching}>
            Logout
          </LogoutButton>
        </Box>
      </Stack>
    </Box>
  )
}
