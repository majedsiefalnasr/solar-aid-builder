import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Money input — accepts full numeric amounts (with all zeros) and
 * renders thousand separators while typing. No metric prefixes (K/M)
 * are ever shown in the input itself.
 *
 * Two value modes:
 * - mode="full" (default): `value` is the actual SAR amount (e.g. 8000000)
 * - mode="thousands": `value` is the amount expressed in thousands of SAR
 *   (legacy storage used by the workflow store). The user still types the
 *   FULL amount in the input; we divide by 1000 internally when calling
 *   `onChange`, and multiply by 1000 when displaying the stored value.
 */
export interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number | "" | null | undefined;
  onChange: (value: number) => void;
  mode?: "full" | "thousands";
  /** Currency suffix shown inside the input on the trailing side. Defaults to "ر.س". */
  currency?: string;
}

const formatWithSeparators = (raw: string) => {
  if (!raw) return "";
  // Keep only digits
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Strip leading zeros (but keep a single 0)
  const trimmed = digits.replace(/^0+(?=\d)/, "");
  return Number(trimmed).toLocaleString("en-US");
};

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      value,
      onChange,
      mode = "full",
      currency = "ر.س",
      className,
      onBlur,
      onFocus,
      ...rest
    },
    ref,
  ) => {
    const { className: inputClassName, ...inputRest } =
      rest as React.InputHTMLAttributes<HTMLInputElement>;
    // Convert stored value -> full SAR for display
    const fullFromValue = (v: typeof value): string => {
      if (v === "" || v === null || v === undefined || Number.isNaN(v as number)) return "";
      const full = mode === "thousands" ? Number(v) * 1000 : Number(v);
      if (!Number.isFinite(full) || full === 0) return "";
      return full.toLocaleString("en-US");
    };

    const [text, setText] = React.useState<string>(() => fullFromValue(value));
    const [focused, setFocused] = React.useState(false);

    // Keep local text in sync when the upstream value changes (and we're not actively typing)
    React.useEffect(() => {
      if (!focused) setText(fullFromValue(value));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatWithSeparators(e.target.value);
      setText(formatted);
      const fullNumber = Number(formatted.replace(/,/g, "")) || 0;
      const stored = mode === "thousands" ? fullNumber / 1000 : fullNumber;
      onChange(stored);
    };

    return (
      <div className={cn("relative", className)}>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          dir="ltr"
          value={text}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setText(fullFromValue(value));
            onBlur?.(e);
          }}
          {...rest}
          className={cn(
            "w-full rounded-xl border border-input bg-background px-3 py-2.5 pe-14 text-left text-sm font-bold tracking-wide text-ink focus:border-primary focus:outline-none",
            rest.className,
          )}
        />
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-[11px] font-bold text-muted-foreground">
          {currency}
        </span>
      </div>
    );
  },
);
MoneyInput.displayName = "MoneyInput";
