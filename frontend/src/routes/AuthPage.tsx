import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/AppButton";
import { Input } from "../components/ui/Input";
import { PageContainer } from "../components/ui/PageContainer";
import { useAuth } from "../features/auth/auth-context";

const authSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type AuthFormValues = z.infer<typeof authSchema>;

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function AuthPage() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const { session, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/app";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (session) {
    return <Navigate to="/app" replace />;
  }

  async function onSubmit(values: AuthFormValues) {
    setFormError(null);
    setFormNotice(null);

    try {
      if (mode === "login") {
        await signIn(values.email, values.password);
        navigate(from, { replace: true });
        return;
      }

      const result = await signUp(values.email, values.password);

      if (result.requiresEmailConfirmation) {
        setFormNotice("Check your email to confirm your account, then sign in.");
        return;
      }

      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Authentication failed.");
    }
  }

  return (
    <PageContainer className="flex min-h-screen items-center justify-center py-10">
      <section className="w-full max-w-md rounded-lg border border-vellum/10 bg-coal/90 p-5 shadow-glow sm:p-7">
        <Link to="/" className="font-display text-2xl text-vellum">
          Life RPG
        </Link>
        <div className="mt-6">
          <p className="text-sm font-bold uppercase text-ember">{mode === "login" ? "Welcome back" : "Begin"}</p>
          <h1 className="mt-1 font-display text-3xl text-vellum">
            {mode === "login" ? "Return to your journal" : "Create your adventurer"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-parchment/70">
            Supabase handles identity. The RPG systems behind it stay protected by the API.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-md border border-vellum/10 bg-ink/70 p-1">
          <button
            type="button"
            className={`rounded px-3 py-2 text-sm font-bold transition ${
              mode === "login" ? "bg-ember text-ink" : "text-parchment/70 hover:text-vellum"
            }`}
            onClick={() => {
              setMode("login");
              setFormError(null);
              setFormNotice(null);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={`rounded px-3 py-2 text-sm font-bold transition ${
              mode === "signup" ? "bg-ember text-ink" : "text-parchment/70 hover:text-vellum"
            }`}
            onClick={() => {
              setMode("signup");
              setFormError(null);
              setFormNotice(null);
            }}
          >
            Sign up
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />

          <AnimatePresence>
            {formError ? (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                className="rounded-md border border-ruby/40 bg-ruby/10 px-3 py-2 text-sm text-ruby"
                role="alert"
              >
                {formError}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {formNotice ? (
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                className="flex items-start gap-2 rounded-md border border-emerald/40 bg-emerald/10 px-3 py-2 text-sm text-emerald"
                role="status"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {formNotice}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <Button type="submit" disabled={isSubmitting}>
            {mode === "login" ? <KeyRound className="h-5 w-5" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
            {isSubmitting ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </section>
    </PageContainer>
  );
}
