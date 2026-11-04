"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type Mode = "login" | "register";

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";
  const target = next && next.startsWith("/") ? next : "/dashboard";

  function update(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? { name: values.name, email: values.email, password: values.password }
            : { email: values.email, password: values.password },
        ),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success(isRegister ? `Welcome aboard, ${data.user.name.split(" ")[0]}!` : "Welcome back!");
      router.push(target);
      router.refresh();
    } catch {
      setFormError("Network error — please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white">
          <Sparkles aria-hidden className="size-[18px]" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">Codomax Blog</span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isRegister
          ? "Start publishing in under a minute. No credit card, no nonsense."
          : "Sign in to keep writing, commenting and managing your posts."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        {isRegister ? (
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Ada Lovelace"
              aria-invalid={Boolean(errors.name)}
              required
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            required
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password}
          hint={isRegister ? "Min. 8 characters" : undefined}
        >
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            </button>
          </div>
        </Field>

        {formError ? (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500">
            {formError}
          </p>
        ) : null}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {isRegister ? "Already have an account? " : "New to Codomax Blog? "}
        <Link
          href={
            isRegister
              ? `/login${target !== "/dashboard" ? `?next=${encodeURIComponent(target)}` : ""}`
              : `/register${target !== "/dashboard" ? `?next=${encodeURIComponent(target)}` : ""}`
          }
          className="font-medium text-primary hover:underline"
        >
          {isRegister ? "Sign in" : "Create one"}
        </Link>
      </p>

      {!isRegister ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-muted/60 p-3.5">
          <p className="text-xs font-medium text-foreground">Demo account</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">ada@codomax.dev · password123</p>
        </div>
      ) : null}
    </div>
  );
}
