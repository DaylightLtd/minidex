"use client";

import { isEqual } from "lodash";
import { useEffect, useState } from "react";

type FormValues = Record<string, any>;

type FormChangeOptions<T extends FormValues> = {
  initialValues: T;
};

type FormChangeResult<T extends FormValues> = {
  values: T;
  setValues: (values: T | ((prev: T) => T)) => void;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  changedFields: Set<keyof T>;
  hasChanges: boolean;
  isDirty: (field: keyof T) => boolean;
  getCreatePayload: () => T;
  getUpdatePayload: () => Partial<T>;
  reset: () => void;
  resetTo: (values: T) => void;
};

export function useFormChanges<T extends FormValues>({
  initialValues,
}: FormChangeOptions<T>): FormChangeResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [changedFields, setChangedFields] = useState<Set<keyof T>>(new Set());

  // Track changes when values change
  useEffect(() => {
    const changes = new Set<keyof T>();
    (Object.keys(values) as (keyof T)[]).forEach((key) => {
      if (!isEqual(values[key], initialValues[key])) {
        changes.add(key);
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChangedFields(changes);
  }, [values, initialValues]);

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const getCreatePayload = (): T => values;

  const getUpdatePayload = (): Partial<T> => {
    const payload: Partial<T> = {};

    changedFields.forEach((field) => {
      payload[field] = values[field];
    });

    return payload;
  };

  const reset = () => setValues(initialValues);
  const resetTo = (newValues: T) => setValues(newValues);
  const hasChanges = changedFields.size > 0;
  const isDirty = (field: keyof T) => changedFields.has(field);

  return {
    values,
    setValues,
    setValue,
    changedFields,
    hasChanges,
    isDirty,
    getCreatePayload,
    getUpdatePayload,
    reset,
    resetTo,
  };
}
