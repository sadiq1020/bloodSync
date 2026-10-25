import type { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | BloodSync",
  description: "Create a BloodSync account to find blood donors or volunteer in Bangladesh.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
