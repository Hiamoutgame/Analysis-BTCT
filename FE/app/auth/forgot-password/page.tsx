import { redirect } from "next/navigation";

export default function ForgotPasswordCompatPage() {
  redirect("/auth/reset-password");
}
