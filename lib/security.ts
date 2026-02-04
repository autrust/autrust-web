/**
 * Utilitaires de sécurité
 */

import { z } from "zod";

/**
 * Sanitize une chaîne pour éviter les injections XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Valider un email de manière stricte
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Valider un numéro de téléphone (format international simplifié)
 */
export function isValidPhone(phone: string): boolean {
  // Format: +32 4 123 45 67 ou +32412345678
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  const cleaned = phone.replace(/\s/g, "");
  return phoneRegex.test(cleaned) && cleaned.length >= 8 && cleaned.length <= 16;
}

/**
 * Valider la longueur d'un texte
 */
export function validateLength(text: string, min: number, max: number): boolean {
  return text.length >= min && text.length <= max;
}

/**
 * Schema Zod pour validation stricte des entrées utilisateur
 */
export const StrictStringSchema = z
  .string()
  .min(1)
  .max(10000)
  .refine((val) => !val.includes("<script"), {
    message: "Contenu non autorisé",
  });

export const EmailSchema = z.string().email().max(255).toLowerCase().trim();

export const PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Format invalide")
  .min(8)
  .max(16);

/**
 * Générer un token CSRF (pour usage futur)
 */
export function generateCsrfToken(): string {
  const crypto = require("node:crypto");
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Valider un token CSRF (pour usage futur)
 */
export function validateCsrfToken(token: string, expected: string): boolean {
  const crypto = require("node:crypto");
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
