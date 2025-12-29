"use server"

import { getDb } from "@/db";
import { Page, pages, pageTranslations } from "@/db/schema";
import { requireAuth } from "@/lib/route-guard";
import { tryCatch } from "@/lib/utils";
import { FormResults } from "@/types/actions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updatePageSchema } from "./fields-schema";
import z from "zod";
import { buildPageTree, updateFullPathForSlugChange, updateFullPathsForTree } from "@/lib/page";
import { FormStatus } from "react-dom";
import { getCurrentSession } from "@/lib/session";


// Todo
 type FormState = {
  errors?: {
    formErrors?: string[]
    fieldErrors?: {
      title?: string[]
      slug?: string[]
      isDraft?: string[]
      showOnMenu?: string[]
      parentId?: string[]
    }
  }
  success?: boolean
  updatedPage?: {
    id: number
    title: string
    slug: string
    isDraft: boolean
    showOnMenu: boolean
    sortOrder: number
    parentId: number | null
  }
}


/**
 * Delete a page by its ID
 * 
 * @param pageId 
 * @returns Status of the deletion operation
 */
export async function deletePageAction(pageId: number): Promise<FormResults<null>> {
  await requireAuth();

  const db = getDb();

  const result = await tryCatch(async () => {
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!existingPage) {
      return {
        errors: {
          formErrors: ["Page not found"],
        },
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
          formErrors: [
            "Cannot delete page with child pages. Please move or delete child pages first.",
          ],
        },
      };
    }

    // Delete page (cascade will delete translations)
    await db.delete(pages).where(eq(pages.id, pageId));

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath(`/${existingPage.slug}`);

    return { success: "Page deleted successfully"};
  });

  if (!result.success) {
    return {
      errors: {
        formErrors: ["Failed to delete page"],
      },
    };
  }

  return result.data;
}

type UpdatePageResult = FormResults<z.infer<typeof updatePageSchema>, Page> 
/**
 * Update a page's properties
 *
 * @param pageId - Page ID (bound parameter)
 * @param formData - Form data from the submitted form
 * @returns Status of the update operation
 */
export async function updatePageAction(
  pageId: number,
  prevState: UpdatePageResult,
  formData: FormData
): Promise<UpdatePageResult> {
  await requireAuth();


  const getData = (formData: FormData) => ({
    title: formData.get("title"),
    slug: formData.get("slug"),
    isDraft: formData.get("isDraft"),
    showOnMenu: formData.get("showOnMenu"),
  });

  const validatedFields = updatePageSchema.safeParse(getData(formData));

  if (!validatedFields.success) {
    return {
      errors: {fieldErrors: z.flattenError(validatedFields.error).fieldErrors},
    };
  }

  const db = getDb();
  const {title, slug, isDraft, showOnMenu } = validatedFields.data;

  const result = await tryCatch(async () => {
    const [existingPage] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, pageId))
      .limit(1);

    if (!existingPage) throw new Error("Page not found");

    // Check if slug is already taken by another page
    const [slugConflict] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (slugConflict && slugConflict.id !== pageId) {
      throw new Error("This slug is already in use by another page");
    }

    // Update page
    const [updatedPage] = await db
      .update(pages)
      .set({
        title,
        slug,
        isDraft,
        showOnMenu,
      })
      .where(eq(pages.id, pageId))
      .returning();

    // Update fullPath if slug changed
    await updateFullPathForSlugChange(pageId, slug);

    revalidatePath("/admin");
    revalidatePath(`/${existingPage.fullPath}`);

    return updatedPage;
  });

  if (!result.success) {
    return {
      errors: {
        formErrors: [result.error.message],
      },
    };
  }

  return {
    success: "Page updated successfully",
    data: result.data,
  };
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

		// First, update all pages' parent and sort order
		for (const page of pagesOrder) {
			await db
				.update(pages)
				.set({
					parentId: page.parentId ? Number(page.parentId) : null,
					sortOrder: page.sortOrder,
				})
				.where(eq(pages.id, Number(page.id)))
				.returning();
		}

		// After updating all parent relationships, fetch the complete tree
		// and update all full paths in a single batch operation
		const allPages = await db.select().from(pages).orderBy(pages.sortOrder);

		// Build the tree structure
		const allTranslations = await db.select().from(pageTranslations);
		const translationsMap = new Map<number, (typeof pageTranslations.$inferSelect)[]>();

		allTranslations.forEach(t => {
			if (!translationsMap.has(t.pageId)) {
				translationsMap.set(t.pageId, []);
			}
			translationsMap.get(t.pageId)!.push(t);
		});

		const tree = buildPageTree(allPages, translationsMap, null);

		// Update full paths for all pages in one batch
		await updateFullPathsForTree(tree);

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
