import type { Role } from './types';
import { ALL_ROLES } from './types';

export const ROLES: Role[] = [...ALL_ROLES];

// Password prefix logic:
// Single word role: first letter
// Multi-word role: initials of each word
const getPasswordPrefix = (role: Role): string => {
  if (role === "Oficina Técnica") return "ot";
  if (role === "Recursos Humanos") return "rh";
  
  // For single words or any other case not explicitly handled above,
  // take the first letter of the first word.
  // This handles "Administración", "Comercial", "Finanzas", "Compras", "Logística", "Marketing"
  const firstWord = role.split(" ")[0];
  return firstWord.charAt(0).toLowerCase();
};

export const validatePassword = (role: Role, pass: string): boolean => {
  const prefix = getPasswordPrefix(role);
  const expectedPassword = `${prefix}@gruponioi`;
  return pass === expectedPassword;
};
