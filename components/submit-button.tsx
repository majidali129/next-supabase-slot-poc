"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-3.5 w-3.5 animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

type SubmitButtonProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  /** Replaces the button's label while its form is submitting. */
  pendingText?: ReactNode;
  /** For icon-only buttons: swap the whole content for a bare spinner instead of a spinner + label. */
  iconOnly?: boolean;
};

/**
 * A `<button type="submit">` that shows a spinner and disables itself while
 * its enclosing form's Server Action is pending, via React's
 * `useFormStatus`. Must be rendered inside a `<form action={...}>`.
 */
export function SubmitButton({
  children,
  pendingText,
  iconOnly = false,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      className={[className, pending ? "cursor-wait" : ""].filter(Boolean).join(" ")}
    >
      {pending ? (
        iconOnly ? (
          <Spinner />
        ) : (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            {pendingText ?? children}
          </span>
        )
      ) : (
        children
      )}
    </button>
  );
}
