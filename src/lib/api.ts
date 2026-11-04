import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fieldErrors } from "@/lib/validation";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Normalises every thrown error into a predictable JSON envelope so the
 * client never has to parse an HTML error page.
 */
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fields: fieldErrors(error) },
      { status: 422 },
    );
  }

  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return fail("You must be signed in to do that.", 401);
  }

  console.error("[api] unhandled error:", error);
  return fail("Something went wrong. Please try again.", 500);
}

/** Returns the session user or a 401 response. */
export async function withUser(): Promise<
  { user: SessionUser; response: null } | { user: null; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { user: null, response: fail("You must be signed in to do that.", 401) };
  return { user, response: null };
}
