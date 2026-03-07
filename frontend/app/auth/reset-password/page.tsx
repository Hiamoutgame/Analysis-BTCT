"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthCard from "@/components/auth/auth-card";
import { forgotPassword, getApiErrorMessage, resetPassword } from "@/lib/auth-api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const isResetFlow = Boolean(resetToken);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const description = useMemo(() => {
    if (isResetFlow) {
      return "Set a new password for your account.";
    }
    return "Enter your email address. We will generate a reset password token.";
  }, [isResetFlow]);

  async function handleSubmit(values: Record<string, string>): Promise<void> {
    try {
      setSubmitError(null);
      setSubmitSuccess(null);

      if (isResetFlow && resetToken) {
        if (values.newPassword !== values.confirmPassword) {
          setSubmitError("Confirm password does not match.");
          return;
        }

        await resetPassword(resetToken, values.newPassword);
        setSubmitSuccess("Password updated successfully. You can sign in now.");
        return;
      }

      const response = await forgotPassword(values.email);
      const resetTokenFromApi = response.reset_token;
      if (resetTokenFromApi) {
        setSubmitSuccess(`Token generated. Open: /auth/reset-password?token=${resetTokenFromApi}`);
        return;
      }

      setSubmitSuccess(response.message);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  return (
    <AuthCard
      title="Reset password"
      description={description}
      submitLabel={isResetFlow ? "Update password" : "Send reset token"}
      submittingLabel={isResetFlow ? "Updating..." : "Sending..."}
      onSubmit={handleSubmit}
      submitError={submitError}
      submitSuccess={submitSuccess}
      fields={
        isResetFlow
          ? [
              {
                label: "New password",
                name: "newPassword",
                type: "password",
                placeholder: "Enter new password",
                autoComplete: "new-password",
              },
              {
                label: "Confirm password",
                name: "confirmPassword",
                type: "password",
                placeholder: "Confirm new password",
                autoComplete: "new-password",
              },
            ]
          : [
              {
                label: "Email",
                name: "email",
                type: "email",
                placeholder: "you@company.com",
                autoComplete: "email",
              },
            ]
      }
      footerPrefix="Remember your password?"
      footerLinkLabel="Sign in"
      footerLinkHref="/auth/sign-in"
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthCard
          title="Reset password"
          description="Loading reset password flow..."
          submitLabel="Loading..."
          fields={[
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "you@company.com",
              autoComplete: "email",
            },
          ]}
          footerPrefix="Remember your password?"
          footerLinkLabel="Sign in"
          footerLinkHref="/auth/sign-in"
        />
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
