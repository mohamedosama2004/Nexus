import RegisterPageForm from "../_components/registerPageForm";
import { isGoogleOAuthConfigured } from "@/src/lib/oauth/google";

export default function RegisterPage() {
  return (
    <RegisterPageForm googleEnabled={isGoogleOAuthConfigured()} />
  );
}
