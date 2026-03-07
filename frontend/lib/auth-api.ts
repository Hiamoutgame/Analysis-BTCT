import type { AxiosError } from "axios";
import type { AuthUser, ForgotPasswordResponse, TokenResponse } from "@/interface/auth/auth.interface";
import { apiClient } from "@/lib/api-client";

export function getApiErrorMessage(error: unknown): string {
  const fallbackMessage = "Unexpected error. Please try again.";

  const axiosError = error as AxiosError<{ detail?: string }>;
  return axiosError.response?.data?.detail || fallbackMessage;
}

export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/register", payload);
  return response.data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/login", payload);
  return response.data;
}

export async function refresh(refreshToken: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", {
    refresh_token: refreshToken,
  });
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", {
    email,
  });
  return response.data;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", {
    reset_token: resetToken,
    new_password: newPassword,
  });
}

export async function getMe(accessToken: string): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
