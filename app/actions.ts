"use server";

import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";

export async function logout() {
	const { session } = await getCurrentSession();
	if (!session) {
		return;
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	redirect("/login");
}

export async function loginWithGitHub() {
	const state = generateState();
	const url = github.createAuthorizationURL(state, []);

	const cookieStore = await cookies();
	cookieStore.set("github_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	redirect(url.toString());
}

export async function submitInvitation(prevState: { error: string }, formData: FormData) {
	const rawCode = formData.get("code");
	const code = typeof rawCode === "string" ? rawCode.trim() : "";

	const { user } = await getCurrentSession();

	if (!user) {
		redirect("/login");
	}

	if (!code) {
		return { error: "Invitation code is required" };
	}

	const invitation = await getInvitationByCode(code);
	if (!invitation || !isInvitationValid(invitation)) {
		return { error: "Invalid or expired invitation code" };
	}

	await useInvitation(code, user.id);
	await acceptInvitationForUser(user.id);

	redirect("/admin");
}

