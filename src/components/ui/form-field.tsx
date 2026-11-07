"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const CONTROL_CLASSES =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-navy-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1";

function fieldBorder(error?: string) {
  return error ? "border-red-400" : "border-navy-100 focus:border-accent-400";
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Validation message shown under the field; also drives aria-invalid/aria-describedby. */
  error?: string;
  wrapperClassName?: string;
}

/** Labeled text input used by the checkout and contact forms — a single
 * shared component so both stay in sync on markup, styling and a11y. */
export function FormField({
  label,
  id,
  error,
  className,
  wrapperClassName,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-semibold text-navy-500"
      >
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(CONTROL_CLASSES, fieldBorder(error), className)}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

/** Labeled select, styled to match FormField. */
export function FormSelect({
  label,
  id,
  error,
  className,
  wrapperClassName,
  children,
  ...props
}: FormSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-xs font-semibold text-navy-500"
      >
        {label}
      </label>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(CONTROL_CLASSES, fieldBorder(error), className)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
