import { db } from "../db";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cache } from "react";
import { cookies } from "next/headers";
import { addMinutes, differenceInMinutes } from "date-fns";
import { type Session, type User, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session = await db.query.sessions.findFirst({
		where: (sessions, { eq }) => eq(sessions.id, sessionId),
		with: {
			user: true
		}
	})
	
	if (!session) {
		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime()) {
		db.delete(sessions).where(eq(sessions.id, sessionId));
		return { session: null, user: null };
	}

	if (differenceInMinutes(session.expiresAt, new Date()) <= 45) {
		session.expiresAt = addMinutes(new Date(), 60);
		db.update(sessions).set({ expiresAt: session.expiresAt }).where(eq(sessions.id, sessionId));
	}
	const {user, ...sessionData} = session;
	return { session: sessionData, user: session.user };
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const token = (await cookies()).get("session")?.value ?? null;

	if (token === null) {
		return { session: null, user: null };
	}
	const result = validateSessionToken(token);
	return result;
});

export function invalidateSession(sessionId: string): void {
	db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function invalidateUserSessions(userId: number): void {
	db.delete(sessions).where(eq(sessions.userId, userId));
}

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	(await cookies()).set("session", token, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	(await cookies()).set("session", "", {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32(tokenBytes).toLowerCase();
	return token;
}

export function createSession(token: string, userId: number): Session {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: addMinutes(new Date(Date.now()), 60) // 1 hour session
	};

	db.insert(sessions).values(session)
	return session;
}


type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };