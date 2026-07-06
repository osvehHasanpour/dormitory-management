import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { login as loginRequest } from "../services/authService";
import type { LoginCredentials } from "../types/auth";
import { getDashboardPathForRole } from "../types/auth";

interface UseLoginResult {
  isSubmitting: boolean;
  error: string | null;
  submitLogin: (credentials: LoginCredentials) => Promise<void>;
  clearError: () => void;
}

export function useLogin(): UseLoginResult {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const submitLogin = async (credentials: LoginCredentials) => {
    setError(null);

    if (!credentials.username.trim()) {
      setError("نام کاربری الزامی است.");
      return;
    }

    if (!credentials.password) {
      setError("رمز عبور الزامی است.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginRequest(credentials);
      login(result.tokens, result.user);
      navigate(getDashboardPathForRole(result.user.role), { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ورود ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submitLogin,
    clearError,
  };
}
