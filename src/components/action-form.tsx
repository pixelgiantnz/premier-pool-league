"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

function PendingFieldset({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-0">
      {children}
    </fieldset>
  );
}

export function AuthForm({
  action,
  children,
  className = "space-y-4",
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form action={action} className={className} suppressHydrationWarning>
      <PendingFieldset>{children}</PendingFieldset>
    </form>
  );
}

const baseButtonClass =
  "rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export function SubmitButton({
  label,
  pendingLabel,
  className = "mt-6 w-full bg-[var(--accent)] px-4 py-3 text-black hover:brightness-110 disabled:hover:brightness-100",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${baseButtonClass} ${className}`}
    >
      {pending ? (pendingLabel ?? `${label}…`) : label}
    </button>
  );
}

export function ActionButton({
  label,
  pendingLabel,
  className = "border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white",
  variant = "default",
}: {
  label: string;
  pendingLabel?: string;
  className?: string;
  variant?: "default" | "danger";
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === "danger"
      ? "border border-red-400/30 px-4 py-2 text-sm text-red-200 hover:bg-red-400/10 disabled:hover:bg-transparent"
      : className;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${baseButtonClass} ${variantClass}`}
    >
      {pending ? (pendingLabel ?? `${label}…`) : label}
    </button>
  );
}
