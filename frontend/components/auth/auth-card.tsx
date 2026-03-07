"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthField = {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  autoComplete?: string;
  optional?: boolean;
};

type FormValues = Record<string, string>;

type AuthCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel?: string;
  fields: AuthField[];
  footerPrefix: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  auxiliaryActionLabel?: string;
  auxiliaryActionHref?: string;
  onSubmit?: (values: FormValues) => Promise<void>;
  submitError?: string | null;
  submitSuccess?: string | null;
};

const passwordMaskIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      fill="currentColor"
    />
  </svg>
);

export default function AuthCard({
  title,
  description,
  submitLabel,
  submittingLabel,
  fields,
  footerPrefix,
  footerLinkLabel,
  footerLinkHref,
  auxiliaryActionLabel,
  auxiliaryActionHref,
  onSubmit,
  submitError,
  submitSuccess,
}: AuthCardProps) {
  const initialValues = useMemo(
    () =>
      fields.reduce<FormValues>((result, field) => {
        result[field.name] = "";
        return result;
      }, {}),
    [fields]
  );

  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChange(name: string, value: string) {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <Card className="auth-card">
      <CardHeader className="space-y-2 p-0">
        <CardTitle className="auth-card-title">{title}</CardTitle>
        <CardDescription className="auth-card-description">{description}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form className="auth-form" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const isPassword = field.type === "password";

            return (
              <div key={field.name} className="field-group">
                <Label className="field-label" htmlFor={field.name}>
                  {field.label}
                  {field.optional ? <span className="optional"> (optional)</span> : null}
                </Label>
                <span className="field-input-wrap">
                  <Input
                    id={field.name}
                    className={`field-input${isPassword ? " with-icon" : ""}`}
                    name={field.name}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    value={formValues[field.name] ?? ""}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    required={!field.optional}
                  />
                  {isPassword ? (
                    <span className="icon-button" aria-hidden="true">
                      {passwordMaskIcon}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}

          {auxiliaryActionLabel && auxiliaryActionHref ? (
            <p className="auth-inline-link">
              <Link className="auth-link" href={auxiliaryActionHref}>
                {auxiliaryActionLabel}
              </Link>
            </p>
          ) : null}

          {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
          {submitSuccess ? <p className="text-sm text-emerald-700">{submitSuccess}</p> : null}

          <Button className="auth-submit" size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel || "Submitting..." : submitLabel}
          </Button>
        </form>
      </CardContent>

      <p className="auth-meta">
        {footerPrefix}{" "}
        <Link className="auth-link" href={footerLinkHref}>
          {footerLinkLabel}
        </Link>
      </p>
    </Card>
  );
}
