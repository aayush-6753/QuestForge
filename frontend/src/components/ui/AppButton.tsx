import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  const styles = {
    primary: "hard-button",
    secondary: "border-2 border-ember/55 bg-vellum/10 text-vellum hover:bg-vellum/15",
    ghost: "text-parchment hover:bg-vellum/10",
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
});
