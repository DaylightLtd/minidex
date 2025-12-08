"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";

import { CatalogItemVisibilityField } from "@/app/(auth)/catalog/components/CatalogItemVisibilityField";
import { factionFormMessages as m } from "@/app/(auth)/catalog/factions/messages";
import { type CatalogItemVisibility } from "@/app/(auth)/catalog/game-systems/hooks/use-game-systems";
import { type UserRole } from "@/app/contexts/user-context";

type FactionFormValues = {
  name: string;
  gameSystemID: string | null;
  parentFactionID: string | null;
  visibility: CatalogItemVisibility;
};

type FactionFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<FactionFormValues>;
  userRoles: UserRole[];
  onClose: () => void;
  onSave: (values: FactionFormValues) => void;
  isPending?: boolean;
};

export function FactionFormDialog({
  open,
  mode,
  initialValues,
  userRoles,
  onClose,
  onSave,
  isPending = false,
}: FactionFormDialogProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [gameSystemID, setGameSystemID] = useState(
    initialValues?.gameSystemID ?? "",
  );
  const [parentFactionID, setParentFactionID] = useState(
    initialValues?.parentFactionID ?? "",
  );
  const [visibility, setVisibility] = useState<CatalogItemVisibility>(
    initialValues?.visibility ?? "private",
  );

  const [nameError, setNameError] = useState<string | null>(null);

  const dialogTitle = mode === "create" ? m.createTitle : m.editTitle;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedGameSystemID = gameSystemID.trim();
    const trimmedParentFactionID = parentFactionID.trim();

    let hasError = false;

    if (!trimmedName) {
      setNameError(m.nameRequired);
      hasError = true;
    } else {
      setNameError(null);
    }

    if (hasError) return;

    onSave({
      name: trimmedName,
      gameSystemID: trimmedGameSystemID || null,
      parentFactionID: trimmedParentFactionID || null,
      visibility,
    });
  };

  const isFormDisabled = isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 2 }}
        >
          <TextField
            label={m.nameLabel}
            placeholder={m.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            error={Boolean(nameError)}
            helperText={nameError}
            InputLabelProps={{ shrink: true, required: true }}
          />

          <TextField
            label={m.gameSystemLabel}
            placeholder={m.gameSystemPlaceholder}
            value={gameSystemID}
            onChange={(event) => setGameSystemID(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            InputLabelProps={{ shrink: true, required: false }}
          />

          <TextField
            label={m.parentFactionLabel}
            placeholder={m.parentFactionPlaceholder}
            value={parentFactionID}
            onChange={(event) => setParentFactionID(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            InputLabelProps={{ shrink: true, required: false }}
          />

          <CatalogItemVisibilityField
            mode={mode}
            value={visibility}
            userRoles={userRoles}
            disabled={isFormDisabled}
            onChange={setVisibility}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isFormDisabled}>
          {m.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={isFormDisabled}>
          {m.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
