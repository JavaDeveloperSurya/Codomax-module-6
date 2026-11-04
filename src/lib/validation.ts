import { Prisma } from "@prisma/client";
import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(160)
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const postSchema = z.object({
  title: z.string().trim().min(6, "Title must be at least 6 characters").max(120),
  excerpt: z
    .string()
    .trim()
    .min(20, "Excerpt must be at least 20 characters")
    .max(220, "Excerpt must be 220 characters or fewer"),
  content: z.string().trim().min(50, "Content must be at least 50 characters"),
  coverImage: z
    .union([z.string().trim().url("Cover image must be a valid URL"), z.literal("")])
    .optional()
    .transform((value) => (value ? value : null)),
  tags: z
    .array(z.string().trim().min(1).max(24))
    .max(6, "Pick up to 6 tags")
    .default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Comment is too short")
    .max(1000, "Comment must be 1,000 characters or fewer"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Flatten a ZodError into `{ field: message }` for form display. */
export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** True for Prisma's unique-constraint violation (P2002). */
export function isUniqueViolation(error: unknown, field?: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  if (!field) return true;
  const target = error.meta?.target;
  return Array.isArray(target) ? target.includes(field) : String(target).includes(field);
}
