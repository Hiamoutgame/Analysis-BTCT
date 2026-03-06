import AuthCard from "@/components/auth/auth-card";

export default function SignInPage() {
  return (
    <AuthCard
      title="Sign in"
      description="Welcome back. Enter your account information to continue."
      submitLabel="Sign in"
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
