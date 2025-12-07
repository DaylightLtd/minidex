"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { FormEvent, useState } from "react";

import { type CatalogItemVisibility } from "@/app/(auth)/catalog/game-systems/hooks/use-game-systems";
import { gameSystemFormMessages as m } from "@/app/(auth)/catalog/game-systems/messages";
import { isValidUrl } from "@/lib/utils/url-validation";

type GameSystemFormValues = {
  name: string;
  publisher: string | null;
  releaseYear: number | null;
  website: string | null;
  visibility: CatalogItemVisibility;
};

type GameSystemFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<GameSystemFormValues>;
  onClose: () => void;
  onSave: (values: GameSystemFormValues) => void;
  isPending?: boolean;
};

const VISIBILITY_OPTIONS: CatalogItemVisibility[] = [
  "private",
  "limited",
  "public",
];

export function GameSystemFormDialog({
  open,
  mode,
  initialValues,
  onClose,
  onSave,
  isPending = false,
}: GameSystemFormDialogProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [publisher, setPublisher] = useState(initialValues?.publisher ?? "");
  const [releaseYear, setReleaseYear] = useState(
    initialValues?.releaseYear?.toString() ?? "",
  );
  const [website, setWebsite] = useState(initialValues?.website ?? "");
  const [visibility, setVisibility] = useState<CatalogItemVisibility>(
    initialValues?.visibility ?? "private",
  );

  const [nameError, setNameError] = useState<string | null>(null);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [releaseYearError, setReleaseYearError] = useState<string | null>(null);

  const dialogTitle = mode === "create" ? m.createTitle : m.editTitle;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedPublisher = publisher?.toString().trim() ?? "";
    const trimmedWebsite = website?.toString().trim() ?? "";
    const trimmedReleaseYear = releaseYear?.toString().trim() ?? "";

    let hasError = false;

    if (!trimmedName) {
      setNameError(m.nameRequired);
      hasError = true;
    } else {
      setNameError(null);
    }

    if (trimmedWebsite && !isValidUrl(trimmedWebsite)) {
      setWebsiteError(m.websiteError);
      hasError = true;
    } else {
      setWebsiteError(null);
    }

    if (trimmedReleaseYear) {
      const yearNumber = Number(trimmedReleaseYear);
      if (!Number.isInteger(yearNumber) || yearNumber <= 0) {
        setReleaseYearError(m.releaseYearError);
        hasError = true;
      } else {
        setReleaseYearError(null);
      }
    } else {
      setReleaseYearError(null);
    }

    if (hasError) {
      return;
    }

    const payload: GameSystemFormValues = {
      name: trimmedName,
      publisher: trimmedPublisher || null,
      releaseYear: trimmedReleaseYear ? Number(trimmedReleaseYear) : null,
      website: trimmedWebsite || null,
      visibility,
    };

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
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            error={Boolean(nameError)}
            helperText={nameError}
            InputLabelProps={{ shrink: true, required: true }}
          />

          <TextField
            label={m.publisherLabel}
            placeholder={m.publisherPlaceholder}
            value={publisher}
            onChange={(event) => setPublisher(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            InputLabelProps={{ shrink: true, required: false }}
          />

          <TextField
            label={m.releaseYearLabel}
            placeholder={m.releaseYearPlaceholder}
            value={releaseYear}
            onChange={(event) => setReleaseYear(event.target.value)}
            fullWidth
            type="number"
            disabled={isFormDisabled}
            error={Boolean(releaseYearError)}
            helperText={releaseYearError}
            InputLabelProps={{ shrink: true, required: false }}
          />

          <TextField
            label={m.websiteLabel}
            placeholder={m.websitePlaceholder}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            fullWidth
            disabled={isFormDisabled}
            error={Boolean(websiteError)}
            helperText={websiteError}
            InputLabelProps={{ shrink: true, required: false }}
          />

          <TextField
            select
            label={m.visibilityLabel}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as CatalogItemVisibility)
            }
            fullWidth
            disabled={isFormDisabled}
            InputLabelProps={{ shrink: true, required: true }}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {m.visibilityOptions[option]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {m.cancel}
        </Button>
        <Button onClick={handleSubmit} disabled={isFormDisabled}>
          {m.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
