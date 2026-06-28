import { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_MESSAGE = 'Não foi possível salvar. Verifique os dados.';

/**
 * Extrai uma mensagem legível de um erro do HttpClient.
 * O NestJS costuma responder com { message: string | string[] } em error.error.
 */
export function extractError(err: unknown, fallback = DEFAULT_MESSAGE): string {
  const apiMessage = (err as HttpErrorResponse)?.error?.message;

  if (Array.isArray(apiMessage)) {
    return apiMessage.join(', ');
  }
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage;
  }
  return fallback;
}

/** Regex simples para validar e-mail. */
export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
