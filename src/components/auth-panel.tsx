import { ReactNode } from "react";

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
      {children}
    </form>
  );
}

export function AuthPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[var(--surface)] p-8 shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          Premier Pool League
        </p>
        <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-white/65">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/70">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-[var(--accent)] focus:ring-2"
      />
    </label>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="mt-6 w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-black transition hover:brightness-110"
    >
      {label}
    </button>
  );
}
