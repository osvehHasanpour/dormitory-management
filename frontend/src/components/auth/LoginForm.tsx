import { useState, type FormEvent } from "react";

import { useLogin } from "../../hooks/useLogin";

export function LoginForm() {
  const { isSubmitting, error, submitLogin, clearError } = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitLogin({ username, password });
  };

  return (
    <form
      className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 sm:px-5 md:gap-5 md:px-8 md:pb-8 md:pt-5 lg:px-8 lg:py-8"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="username">
        نام کاربری
      </label>
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        placeholder="نام کاربری "
        value={username}
        onChange={(event) => {
          clearError();
          setUsername(event.target.value);
        }}
        className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30 md:h-12"
      />

      <label className="sr-only" htmlFor="password">
        رمز عبور
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="رمز عبور"
        value={password}
        onChange={(event) => {
          clearError();
          setPassword(event.target.value);
        }}
        className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors placeholder:text-ash focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30 md:h-12"
      />

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-error/20 bg-error-pale px-4 py-3 text-body-sm text-error"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-ash md:h-12"
      >
        {isSubmitting ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}
