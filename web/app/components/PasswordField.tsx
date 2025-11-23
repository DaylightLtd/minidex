"use client";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import { useState } from "react";

type PasswordFieldProps = Omit<TextFieldProps, "type">;

export function PasswordField({ InputProps, ...rest }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword((prev) => !prev);

  const adornment = (
    <InputAdornment position="end">
      <IconButton onClick={toggleVisibility} edge="end">
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <TextField
      {...rest}
      type={showPassword ? "text" : "password"}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <>
            {InputProps?.endAdornment}
            {adornment}
          </>
        ),
      }}
    />
  );
}
