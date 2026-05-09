"use client";

import { useState } from "react";

interface InlineFieldEditorOptions {
  onSave: (value: string) => Promise<void>;
  getInitialValue: () => string;
  validate?: (value: string) => string | null;
}

export function useInlineFieldEditor({
  onSave,
  getInitialValue,
  validate,
}: InlineFieldEditorOptions) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(getInitialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValue(getInitialValue());
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setValue(getInitialValue());
    setEditing(false);
  }

  async function save() {
    if (validate) {
      const validationError = validate(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(value);
      setEditing(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (err as Record<string, string>)?.message || "Failed to save. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return {
    editing,
    value,
    saving,
    error,
    startEditing,
    cancelEditing,
    save,
    onChange: setValue,
  };
}
