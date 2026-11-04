import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { created, fail, handleError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return fail("An account with that email already exists.", 409, {
        fields: { email: "This email is already registered." },
      });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hashPassword(data.password),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await setSessionCookie(user);
    return created({ user });
  } catch (error) {
    return handleError(error);
  }
}
