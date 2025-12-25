"use server";
// import {
// 	getCurrentSession, invalidateSession, deleteSessionTokenCookie
// } from "@/lib/session";

import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";

interface ActionResult {
	error: string | null;
}

// export async function logout(): Promise<ActionResult> {
// 	const { session } = await getCurrentSession();
// 	if (!session) {
// 		return {
// 			error: "Unauthorized"
// 		};
// 	}

// 	await invalidateSession(session.id);
// 	await deleteSessionTokenCookie();
// 	return redirect("/login");


// }

export async function loginWithGitHub(): Promise<void> {
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

	return redirect(url.toString());
}
