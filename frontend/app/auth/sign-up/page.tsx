import AuthCard from "@/components/auth/auth-card";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Sign up"
      description="Create your account to start analyzing financial reports."
      submitLabel="Create account"
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
