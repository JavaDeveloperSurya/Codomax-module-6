import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handleError, ok } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const data = loginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    // Same message + same work for unknown email and wrong password
    // so the endpoint cannot be used to enumerate accounts.
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    await setSessionCookie(session);
    return ok({ user: session });
  } catch (error) {
    return handleError(error);
  }
}
