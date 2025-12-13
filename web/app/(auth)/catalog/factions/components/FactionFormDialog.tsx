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
import { type Faction } from "@/app/(auth)/catalog/factions/hooks/use-factions";
import { factionFormMessages as m } from "@/app/(auth)/catalog/factions/messages";
import { type CatalogItemVisibility } from "@/app/(auth)/catalog/game-systems/hooks/use-game-systems";
import {
  LookupDropdown,
  type LookupOption,
} from "@/app/(auth)/components/LookupDropdown";
import { type UserRole } from "@/app/contexts/user-context";
import { api } from "@/lib/api-client";
import { useFormChanges } from "@/lib/hooks/use-form-changes";

export type FactionFormValues = {
  name: string;
  gameSystemID: string | null;
  parentFactionID: string | null;
  visibility: CatalogItemVisibility;
};

type FactionFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<
    FactionFormValues & {
      gameSystemName?: string | null;
      parentFactionName?: string | null;
    }
  >;
  currentFactionId?: string | null;
  userRoles: UserRole[];
  onClose: () => void;
  onSave: (values: FactionFormValues | Partial<FactionFormValues>) => void;
  isPending?: boolean;
};

export function FactionFormDialog({
  open,
  mode,
  initialValues,
  currentFactionId,
  userRoles,
  onClose,
  onSave,
  isPending = false,
}: FactionFormDialogProps) {
  const defaultValues: FactionFormValues = {
    name: "",
    gameSystemID: null,
    parentFactionID: null,
    visibility: "private",
  };

  const { values, setValue, hasChanges, getCreatePayload, getUpdatePayload } =
    useFormChanges<FactionFormValues>({
      initialValues:
        mode === "edit" && initialValues
          ? {
              name: initialValues.name ?? "",
              gameSystemID: initialValues.gameSystemID ?? null,
              parentFactionID: initialValues.parentFactionID ?? null,
              visibility: initialValues.visibility ?? "private",
            }
          : defaultValues,
    });

  // Derive LookupOption objects from hook values
  const gameSystem: LookupOption | null = values.gameSystemID
    ? {
        id: values.gameSystemID,
        name: initialValues?.gameSystemName ?? values.gameSystemID,
      }
    : null;

  const parentFaction: LookupOption | null = values.parentFactionID
    ? {
        id: values.parentFactionID,
        name: initialValues?.parentFactionName ?? values.parentFactionID,
      }
    : null;

  const [nameError, setNameError] = useState<string | null>(null);
  const dialogTitle = mode === "create" ? m.createTitle : m.editTitle;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = values.name.trim();

    let hasError = false;

    if (!trimmedName) {
      setNameError(m.nameRequired);
      hasError = true;
    } else {
      setNameError(null);
    }

    if (hasError) return;

    setValue("name", trimmedName);
    const payload = mode === "create" ? getCreatePayload() : getUpdatePayload();
    onSave(payload);
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
            value={values.name}
            onChange={(event) => setValue("name", event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            error={Boolean(nameError)}
            helperText={nameError}
            InputLabelProps={{ shrink: true, required: true }}
          />

          <LookupDropdown
            label={m.gameSystemLabel}
            placeholder={m.gameSystemPlaceholder}
            value={gameSystem}
            onChange={(option) => setValue("gameSystemID", option?.id || null)}
            fetcher={async (q) => {
              const res = await api.get<{
                data: { id: string; name: string }[];
              }>("/v1/game-systems", { params: { q, limit: 10 } });
              return res.data;
            }}
            disabled={isFormDisabled}
          />

          <LookupDropdown
            label={m.parentFactionLabel}
            placeholder={m.parentFactionPlaceholder}
            value={parentFaction}
            onChange={(option) =>
              setValue("parentFactionID", option?.id || null)
            }
            excludeIds={currentFactionId ? [currentFactionId] : undefined}
            fetcher={async (q) => {
              const res = await api.get<{ data: Faction[] }>("/v1/factions", {
                params: { q, limit: 10 },
              });
              return res.data.map((f) => ({ id: f.id, name: f.name }));
            }}
            disabled={isFormDisabled}
          />

          <CatalogItemVisibilityField
            mode={mode}
            value={values.visibility}
            userRoles={userRoles}
            disabled={isFormDisabled}
            onChange={(value) => setValue("visibility", value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isFormDisabled}>
          {m.cancel}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isFormDisabled || (mode === "edit" && !hasChanges)}
        >
          {m.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
