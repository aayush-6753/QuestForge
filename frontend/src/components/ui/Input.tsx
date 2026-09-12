import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, id, label, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-semibold text-parchment/90" htmlFor={inputId}>
      {label}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "min-h-12 rounded-md border border-vellum/15 bg-ink/70 px-3 text-base text-vellum shadow-inner shadow-black/30 transition placeholder:text-parchment/40",
          "focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/35",
          error && "border-ruby focus:border-ruby focus:ring-ruby/30",
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={inputId ? `${inputId}-error` : undefined} className="text-sm font-medium text-ruby">
          {error}
        </span>
      ) : null}
    </label>
  );
});
