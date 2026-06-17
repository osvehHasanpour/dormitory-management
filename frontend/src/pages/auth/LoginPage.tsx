import { AuthHero } from '../../components/auth/AuthHero'
import { LoginForm } from '../../components/auth/LoginForm'

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-8">
      <div className="w-full max-w-[420px] overflow-hidden rounded-md bg-canvas shadow-elevated">
        <h1 className="px-4 pb-2 pt-6 text-center text-heading-xl text-ink">ورود به سامانه</h1>
        <AuthHero />
        <LoginForm />
      </div>
    </main>
  )
}
