import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, requestKey } from "@/lib/rate-limit";
import { cleanText, isValidUsername, LIMITS } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (isRateLimited(requestKey(req, "signup"), 8, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const payload = await req.json();
    const username = cleanText(payload?.username, LIMITS.username);
    const password = typeof payload?.password === "string" ? payload.password : "";

    if (!isValidUsername(username) || password.length < 8 || password.length > LIMITS.password) {
      return NextResponse.json(
        { error: "Use a 3-40 character ID and an 8-128 character password" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ID already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (err) {
    console.error("SIGNUP_ROUTE_ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
