export function traduzirErroAuth(message: string | undefined | null): string {
  if (!message) return "Ocorreu um erro inesperado. Tente novamente.";
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered") || m.includes("already exists"))
    return "Este e-mail já está cadastrado.";
  if (m.includes("password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (m.includes("network")) return "Sem conexão. Verifique sua internet.";
  return message;
}
