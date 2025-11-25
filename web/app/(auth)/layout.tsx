"use client";

import HomeOutlined from "@mui/icons-material/HomeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

import LogoutButton from "@/app/(auth)/components/LogoutButton";
import {
  ExpandableNavItem,
  NavItem,
  NavItemChild,
} from "@/app/(auth)/components/NavItems";
import { UserAvatar } from "@/app/(auth)/components/UserAvatar";
import { useCurrentProfile } from "@/app/(auth)/hooks/use-current-profile";
import { layoutMessages as m } from "@/app/(auth)/messages";
import { useCurrentUser } from "@/app/context/user-context";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, isLoading: isProfileLoading } = useCurrentProfile();
  const { user } = useCurrentUser();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchor);

  const displayName = profile?.displayName ?? m.user;
  const isAdmin = user?.roles.includes("admin") ?? false;

  function handleAvatarClick(event: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(event.currentTarget);
  }

  function handleMenuClose() {
    setMenuAnchor(null);
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 260,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: "background.default",
          px: 2,
          py: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {m.appName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {m.adminConsole}
          </Typography>
        </Box>

        <List sx={{ flexGrow: 1, p: 0.5 }}>
          <NavItem label={m.home} href="/home" icon={HomeOutlined} exact />
          {isAdmin && (
            <ExpandableNavItem
              label={m.admin}
              icon={SettingsOutlined}
              basePath="/admin"
            >
              <NavItemChild
                label={m.users}
                href="/admin/users"
                icon={PeopleOutlined}
              />
            </ExpandableNavItem>
          )}
        </List>

        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} {m.appName}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            pl: 4,
            pr: 2,
            pt: 1,
            bgcolor: "background.default",
          }}
        >
          <IconButton onClick={handleAvatarClick} disabled={isProfileLoading}>
            <UserAvatar
              displayName={displayName}
              avatarURL={profile?.avatarURL}
              isLoading={isProfileLoading}
            />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={isMenuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{displayName}</Typography>
            </Box>
            <Divider />
            <MenuItem
              component={Link}
              href="/home"
              onClick={handleMenuClose}
              sx={{ px: 1, mx: 1, mt: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <HomeOutlined fontSize="small" />
              </ListItemIcon>
              {m.home}
            </MenuItem>
            <MenuItem
              component={Link}
              href="/me"
              onClick={handleMenuClose}
              sx={{ px: 1, mx: 1, mt: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PersonOutlined fontSize="small" />
              </ListItemIcon>
              {m.profile}
            </MenuItem>
            <MenuItem
              disableRipple
              sx={{
                px: 1,
                mx: 1,
                mt: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "error.light",
                },
                "& .MuiButton-root": {
                  width: "100%",
                  justifyContent: "center",
                  fontWeight: 700,
                  py: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                },
              }}
            >
              <LogoutButton
                variant="text"
                fullWidth
                color="error"
                onLoggedOut={handleMenuClose}
              >
                {m.logout}
              </LogoutButton>
            </MenuItem>
          </Menu>
        </Box>

        <Box component="main" sx={{ flex: 1, px: 4, py: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
