import { GitHub } from "arctic";

// TODO: Update redirect URI for production
export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID ?? "",
	process.env.GITHUB_CLIENT_SECRET ?? "",
	process.env.GITHUB_CLIENT_REDIRECT_URI ?? "http://localhost:3000/api/login/github/callback"
);
