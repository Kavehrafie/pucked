"use server";


import { z } from "zod";
import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";
import { deleteSessionTokenCookie, getCurrentSession, invalidateSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";
import { tryCatch } from "@/lib/utils";
import { db } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

type FormState = {
  errors?: {
    title?: string[]
    slug?: string[]
    isDraft?: string[]
    parentId?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function logout() {
	const { session } = await getCurrentSession();
	if (!session) {
		return;
	}

	await invalidateSession(session.id);
	await deleteSessionTokenCookie();
	redirect("/login");
}

export async function loginWithGitHub(redirectTo?: string) {
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

	// Store the redirect URL (with locale) to use after successful OAuth
	if (redirectTo) {
		cookieStore.set("github_oauth_redirect", redirectTo, {
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 60 * 10,
			sameSite: "lax"
		});
	}

	redirect(url.toString());
}

export async function checkInvitationStatus() {
	const { user } = await getCurrentSession();
	
	if (!user) {
		return { authenticated: false, needsInvitation: false };
	}

	return {
		authenticated: true,
		needsInvitation: user.invitationAcceptedAt === null,
		invitationAcceptedAt: user.invitationAcceptedAt,
	};
}

export async function submitInvitation(prevState: { error: string }, formData: FormData) {
	const rawCode = formData.get("code");
	const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

	const { user } = await getCurrentSession();

	if (!user) {
		return { error: "You must be logged in to submit an invitation code" };
	}

	// Check if user already accepted invitation
	if (user.invitationAcceptedAt !== null) {
		return { error: "You have already accepted an invitation" };
	}

	if (!code) {
		return { error: "Invitation code is required" };
	}

	// Validate code format (XXXX-XXXX-XXXX)
	const codePattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
	if (!codePattern.test(code)) {
		return { error: "Invalid code format. Expected format: XXXX-XXXX-XXXX" };
	}

	const invitation = await getInvitationByCode(code);
	
	if (!invitation) {
		return { error: "Invitation code not found. Please check and try again." };
	}

	if (!isInvitationValid(invitation)) {
		if (invitation.usedBy !== null) {
			return { error: "This invitation code has already been used." };
		}
		if (new Date() > invitation.expiresAt) {
			return { error: "This invitation code has expired." };
		}
		return { error: "Invalid or expired invitation code" };
	}

	try {
		await useInvitation(code, user.id);
		await acceptInvitationForUser(user.id);
	} catch {
		return { error: "Failed to accept invitation. Please try again." };
	}

	redirect("/admin");
}



 
const createPageSchema = z.object({
	title: z.string().min(1).max(100),
})

function slugify(text: string) : string {
	return text.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.trim();
}

export async function createPageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const rawTitle = formData.get("title");

	const validatedFields = createPageSchema.safeParse({
		title: rawTitle,
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	// Generate slug from title if not provided
	const slug = slugify(validatedFields.data.title);

	try {
		const [newPage] = await db.insert(pages).values({
			title: validatedFields.data.title,
			slug: slug,
			isDraft: true,
		}).returning();

		// Create initial translations for both locales
		await db.insert(pageTranslations).values([
			{
				pageId: newPage.id,
				locale: "en",
				title: validatedFields.data.title,
				content: { root: { props: {}, children: [] }},
			},
			{
				pageId: newPage.id,
				locale: "fa",
				title: validatedFields.data.title,
				content: { root: { props: {}, children: [] } },
			},
		]);

		revalidatePath("/admin");
	} catch (error) {
		console.log("Error creating page:", error);
		return {
			errors: {
				_form: ["Failed to create page. Please try again."],
			},
		};
	}

	redirect("/admin")
}

/**
 * Save page order after drag and drop reordering
 */
export async function savePageOrder(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		return {
			errors: {
				_form: ["You must be logged in to save page order"],
			},
		};
	}

	// Get the order data from form data
	const orderData = formData.get("order");
	if (!orderData || typeof orderData !== "string") {
		return {
			errors: {
				_form: ["Invalid order data"],
			},
		};
	}

	try {
		const pagesOrder = JSON.parse(orderData) as Array<{
			id: string;
			parentId: string | null;
			sortOrder: number;
		}>;

		console.log("Saving page order:", pagesOrder);

		// Update each page's parent and sort order
		for (const page of pagesOrder) {
			console.log(`Updating page ${page.id}: parentId=${page.parentId}, sortOrder=${page.sortOrder}`);
			await db
				.update(pages)
				.set({
					parentId: page.parentId ? Number(page.parentId) : null,
					sortOrder: page.sortOrder,
				})
				.where(eq(pages.id, Number(page.id)));
		}

		revalidatePath("/admin");

		return { success: true };
	} catch (error) {
		console.error("Error saving page order:", error);
		return {
			errors: {
				_form: ["Failed to save page order. Please try again."],
			},
		};
	}
}


const pageContentSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.any().optional().nullable(),
});

export async function savePageContent(
	pageId: number,
	locale: string,
	prevState: FormState,
	formData: FormData
) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const rawTitle = formData.get("title");
	const rawContent = formData.get("content");

	// Parse content if it's a string
	let content = rawContent;
	if (typeof rawContent === "string") {
		try {
			content = JSON.parse(rawContent);
		} catch (error) {
			return {
				errors: {
					_form: ["Invalid content format. Content must be valid JSON."],
				},
			};
		}
	}

	const validatedFields = pageContentSchema.safeParse({
		title: rawTitle,
		content: content,
	});

	if (!validatedFields.success) {
		console.log("Validation errors:", validatedFields.error.flatten().fieldErrors);
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { title, content: validatedContent } = validatedFields.data;

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			return {
				errors: {
					_form: ["Page not found"],
				},
			};
		}

		// Update or insert page translation
		await db
			.insert(pageTranslations)
			.values({
				pageId,
				locale,
				title,
				content: validatedContent || { root: { props: {}, children: [] } },
				published: true,
			})
			.onConflictDoUpdate({
				target: [pageTranslations.pageId, pageTranslations.locale],
				set: {
					title,
					content: validatedContent || { root: { props: {}, children: [] } },
					published: true,
				},
			});

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${locale}/${existingPage.slug}`);

		return { success: true };
	} catch (error) {
		console.error("Error saving page content:", error);
		return {
			errors: {
				_form: ["Failed to save page content. Please try again."],
			},
		};
	}
}

const updatePageSchema = z.object({
	pageId: z.string().transform((val) => parseInt(val, 10)),
	title: z.string().min(1).max(200),
	slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
	isDraft: z.string().optional().transform((val) => val === "on"),
	showOnMenu: z.string().optional().transform((val) => val === "on"),
});

export async function updatePageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const validatedFields = updatePageSchema.safeParse({
		pageId: formData.get("pageId"),
		title: formData.get("title"),
		slug: formData.get("slug"),
		isDraft: formData.get("isDraft"),
		showOnMenu: formData.get("showOnMenu"),
	});

	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
		};
	}

	const { pageId, title, slug, isDraft, showOnMenu } = validatedFields.data;

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			return {
				errors: {
					_form: ["Page not found"],
				},
				success: false,
			};
		}

		// Check if slug is already taken by another page
		const [slugConflict] = await db
			.select()
			.from(pages)
			.where(eq(pages.slug, slug))
			.limit(1);

		if (slugConflict && slugConflict.id !== pageId) {
			return {
				errors: {
					slug: ["This slug is already in use by another page"],
				},
				success: false,
			};
		}

		// Update page
		await db
			.update(pages)
			.set({
				title,
				slug,
				isDraft,
				showOnMenu,
			})
			.where(eq(pages.id, pageId));

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${existingPage.slug}`);

		return { success: true };
	} catch (error) {
		console.error("Error updating page:", error);
		return {
			errors: {
				_form: ["Failed to update page. Please try again."],
			},
			success: false,
		};
	}
}

const deletePageSchema = z.object({
	pageId: z.string().transform((val) => parseInt(val, 10)),
});

export async function deletePageAction(prevState: FormState, formData: FormData) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	const validatedFields = deletePageSchema.safeParse({
		pageId: formData.get("pageId"),
	});

	if (!validatedFields.success) {
		return {
			errors: {
				_form: ["Invalid page ID"],
			},
			success: false,
		};
	}

	const { pageId } = validatedFields.data;

	try {
		// Check if page exists
		const [existingPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.id, pageId))
			.limit(1);

		if (!existingPage) {
			return {
				errors: {
					_form: ["Page not found"],
				},
				success: false,
			};
		}

		// Check if page has children
		const [childPage] = await db
			.select()
			.from(pages)
			.where(eq(pages.parentId, pageId))
			.limit(1);

		if (childPage) {
			return {
				errors: {
					_form: ["Cannot delete page with child pages. Please move or delete child pages first."],
				},
				success: false,
			};
		}

		// Delete page (cascade will delete translations)
		await db.delete(pages).where(eq(pages.id, pageId));

		// Revalidate paths
		revalidatePath("/admin");
		revalidatePath(`/${existingPage.slug}`);

		return { success: true };
	} catch (error) {
		console.error("Error deleting page:", error);
		return {
			errors: {
				_form: ["Failed to delete page. Please try again."],
			},
			success: false,
		};
	}
}