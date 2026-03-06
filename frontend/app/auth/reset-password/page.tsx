import AuthCard from "@/components/auth/auth-card";


export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Enter your email address. We will send a reset password link."
      submitLabel="Send reset link"
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
  );
}
