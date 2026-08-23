import LoginPageForm from "../_components/loginPageForm";
import { isGoogleOAuthConfigured } from "@/src/lib/oauth/google";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <LoginPageForm
      oauthError={error}
      googleEnabled={isGoogleOAuthConfigured()}
    />
  );
}
