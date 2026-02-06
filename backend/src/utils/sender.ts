export const sendVerificationCode = async (email: string, code: string) => {
  console.log(`[EMAIL MOCK] Enviando código ${code} a ${email}`);
  return true;
};