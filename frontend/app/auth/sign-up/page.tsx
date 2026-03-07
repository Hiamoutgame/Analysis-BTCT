"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/auth-card";
import { getApiErrorMessage, register } from "@/lib/auth-api";
import { setAuthTokens } from "@/lib/auth-storage";

export default function SignUpPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: Record<string, string>): Promise<void> {
    const password = values.password;
    const confirmPassword = values.confirmPassword;

    if (password !== confirmPassword) {
      setSubmitError("Confirm password does not match.");
      return;
    }

    try {
      setSubmitError(null);
      const response = await register({
        email: values.email,
        password,
        full_name: values.fullName,
      });

      setAuthTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });

      router.push("/user");
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  return (
    <AuthCard
      title="Sign up"
      description="Create your account to start analyzing financial reports."
      submitLabel="Create account"
      submittingLabel="Creating..."
      onSubmit={handleSubmit}
      submitError={submitError}
      fields={[
        {
          label: "Full name",
          name: "fullName",
          type: "text",
          placeholder: "Your full name",
          autoComplete: "name",
        },
        {
          label: "Email",
          name: "email",
          type: "email",
          placeholder: "you@company.com",
          autoComplete: "email",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          placeholder: "Create password",
          autoComplete: "new-password",
        },
        {
          label: "Confirm password",
          name: "confirmPassword",
          type: "password",
          placeholder: "Re-enter password",
          autoComplete: "new-password",
        },
      ]}
      footerPrefix="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/auth/sign-in"
    />
  );
}
