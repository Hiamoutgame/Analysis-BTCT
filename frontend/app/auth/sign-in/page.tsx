"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/auth-card";
import { getApiErrorMessage, login } from "@/lib/auth-api";
import { setAuthTokens } from "@/lib/auth-storage";

export default function SignInPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(values: Record<string, string>): Promise<void> {
    try {
      setSubmitError(null);
      const response = await login({
        email: values.email,
        password: values.password,
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
      title="Sign in"
      description="Welcome back. Enter your account information to continue."
      submitLabel="Sign in"
      submittingLabel="Signing in..."
      onSubmit={handleSubmit}
      submitError={submitError}
      fields={[
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
          placeholder: "Enter password",
          autoComplete: "current-password",
        },
      ]}
      auxiliaryActionLabel="Forgot password?"
      auxiliaryActionHref="/auth/reset-password"
      footerPrefix="Do not have an account?"
      footerLinkLabel="Sign up"
      footerLinkHref="/auth/sign-up"
    />
  );
}
