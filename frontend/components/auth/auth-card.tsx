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

type AuthCardProps = {
  title: string;
  description: string;
  submitLabel: string;
  fields: AuthField[];
  footerPrefix: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  auxiliaryActionLabel?: string;
  auxiliaryActionHref?: string;
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
  fields,
  footerPrefix,
  footerLinkLabel,
  footerLinkHref,
  auxiliaryActionLabel,
  auxiliaryActionHref,
}: AuthCardProps) {
  return (
    <Card className="auth-card">
      <CardHeader className="space-y-2 p-0">
        <CardTitle className="auth-card-title">{title}</CardTitle>
        <CardDescription className="auth-card-description">{description}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form className="auth-form">
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

          <Button className="auth-submit" size="lg" type="submit">
            {submitLabel}
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
