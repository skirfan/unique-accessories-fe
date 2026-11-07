"use client";
import { useId } from "react";
import { Button, TextInput, NativeSelect, Switch } from "@mantine/core";
import { statusLabel } from "@/types/commerce";
export function AdminButton({
  variant = "primary",
  busy,
  className = "",
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <Button
      {...props}
      disabled={disabled}
      loading={busy}
      color={variant === "danger" ? "red" : "blue"}
      variant={
        variant === "secondary"
          ? "default"
          : variant === "ghost"
            ? "subtle"
            : "filled"
      }
      className={className}
    >
      {children}
    </Button>
  );
}
export function AdminField({
  label,
  hint,
  wrapperClassName = "",
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  hint?: string;
  wrapperClassName?: string;
}) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <TextInput
      {...props}
      id={id}
      label={label}
      description={hint}
      className={wrapperClassName}
      inputWrapperOrder={["label", "input", "description", "error"]}
    />
  );
}
export function AdminSelect({
  label,
  children,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label: string;
}) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return (
    <NativeSelect {...props} id={id} label={label}>
      {children}
    </NativeSelect>
  );
}
export function AdminToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Switch
      label={label}
      description={description}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
      labelPosition="left"
      size="md"
      className="ad-library-switch"
    />
  );
}
export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`ad-badge ad-badge--${value.toLowerCase()}`}>
      <i />
      {statusLabel(value)}
    </span>
  );
}
export function AdminPageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="ad-page-heading">
      <div>
        {eyebrow && <p className="ad-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="ad-heading-actions">{children}</div>}
    </div>
  );
}
