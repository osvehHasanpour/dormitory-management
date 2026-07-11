import { AuthHero } from "../../components/auth/AuthHero";
import { LoginForm } from "../../components/auth/LoginForm";
import { PageShell } from "../../components/layout/PageShell";

export function LoginPage() {
  return (
    <PageShell
      bottomSpacing="none"
      className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8"
    >
      <div className="glass-card w-full max-w-[420px] overflow-hidden sm:max-w-md md:max-w-xl lg:max-w-4xl">
        <h1 className="px-4 pb-3 pt-5 text-center text-page-title text-ink sm:pt-6 md:px-6 md:pb-4 md:pt-7 lg:pb-4">
          ورود به سامانه
        </h1>

        <div className="lg:grid lg:grid-cols-2 lg:items-stretch">
          <AuthHero />

          <div className="flex flex-col justify-center border-t border-hairline/40 lg:border-t-0 lg:border-s lg:border-hairline/40">
            <LoginForm />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
