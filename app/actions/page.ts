"use server"

import { getDb } from "@/db";
import { pages } from "@/db/schema";
import { requireAuth } from "@/lib/route-guard";
import { tryCatch } from "@/lib/utils";
import { FormResults } from "@/types/actions";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
