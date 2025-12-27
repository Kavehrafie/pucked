"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@measured/puck";
import { Trash2 } from "lucide-react";
import { updatePageAction, deletePageAction } from "@/app/actions";
import { Page } from "@/db/schema";
import { useNotifications } from "@/contexts/notification-context";
import { usePageTree } from "@/contexts/page-tree-context";
import { usePageSelection } from "@/components/admin/page-selection-context";
import { cn } from "@/lib/utils";

interface PagePropertiesFormProps {
  page: Page;
}

type FormState = {
  success?: boolean;
  updatedPage?: Page;
  errors?: {
    _form?: string[];
    [key: string]: any;
  };
};

const initialState: FormState = {
  success: false,
  errors: {}
};

export function PagePropertiesForm({ page }: PagePropertiesFormProps) {
  const [state, formAction] = useActionState(updatePageAction as any, initialState);
  const [deleteState, deleteFormAction] = useActionState(deletePageAction as any, initialState);
  const { showSuccess, showError } = useNotifications();
  const { updatePageInTree, removePageFromTree } = usePageTree();
  const { setSelectedPage, clearSelection } = usePageSelection();

  // Handle successful update
  useEffect(() => {
    if (state.success && state.updatedPage) {
      showSuccess("Page updated successfully!");
      updatePageInTree(state.updatedPage);
      // Update the selected page in context
      setSelectedPage(state.updatedPage);
    }
  }, [state.success, state.updatedPage, showSuccess, updatePageInTree, setSelectedPage]);

  // Handle successful delete
  useEffect(() => {
    if (deleteState.success) {
      showSuccess("Page deleted successfully!");
      removePageFromTree(page.id);
      clearSelection();
    }
  }, [deleteState.success, showSuccess, removePageFromTree, page.id, clearSelection]);

  // Handle form errors
  useEffect(() => {
    if (state.errors && Object.keys(state.errors).length > 0) {
      // Only show notification for form-level errors, not field errors
      if (state.errors._form) {
        showError(state.errors._form[0] || "Failed to update page");
      }
    }
  }, [state.errors, showError]);

  // Handle delete errors
  useEffect(() => {
    if (deleteState.errors && Object.keys(deleteState.errors).length > 0) {
      if (deleteState.errors._form) {
        showError(deleteState.errors._form[0] || "Failed to delete page");
      }
    }
  }, [deleteState.errors, showError]);

  return (
    <div className="flex flex-col gap-4">
      {/* Page ID */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Page ID
        </label>
        <input
          type="text"
          value={page.id}
          disabled
          className="w-full px-3 py-2 rounded-md border border-border bg-muted text-muted-foreground text-xs cursor-not-allowed"
        />
      </div>

      {/* Title Form */}
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="pageId" value={page.id} />

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-foreground mb-1"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={page.title}
            placeholder="Enter page title"
            required
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-background text-foreground text-xs",
              !state.success && state.errors && 'title' in state.errors
                ? "border-destructive"
                : "border-input"
            )}
          />
          {!state.success && state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
            <p className="text-xs text-destructive mt-1">
              {state.errors.title[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-xs font-medium text-foreground mb-1"
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={page.slug}
            placeholder="page-url-slug"
            required
            pattern="[a-z0-9-]+"
            className={cn(
              "w-full px-3 py-2 rounded-md border bg-background text-foreground text-xs",
              !state.success && state.errors && 'slug' in state.errors
                ? "border-destructive"
                : "border-input"
            )}
          />
          {!state.success && state.errors && 'slug' in state.errors && Array.isArray(state.errors.slug) && state.errors.slug.length > 0 && (
            <p className="text-xs text-destructive mt-1">
              {state.errors.slug[0]}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Draft Status */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              name="isDraft"
              defaultChecked={page.isDraft}
              className={cn(
                "w-4 h-4 cursor-pointer",
                !state.success && state.errors && 'isDraft' in state.errors
                  ? "border-destructive"
                  : ""
              )}
            />
            <span>Draft (unpublished)</span>
          </label>
          {!state.success && state.errors && 'isDraft' in state.errors && Array.isArray(state.errors.isDraft) && state.errors.isDraft.length > 0 && (
            <p className="text-xs text-destructive mt-1 ml-6">
              {state.errors.isDraft[0]}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 ml-6">
            Draft pages are not visible to visitors
          </p>
        </div>

        {/* Show on Menu */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
              type="checkbox"
              name="showOnMenu"
              defaultChecked={page.showOnMenu}
              className={cn(
                "w-4 h-4 cursor-pointer",
                !state.success && state.errors && 'showOnMenu' in state.errors
                  ? "border-destructive"
                  : ""
              )}
            />
            <span>Show in navigation menu</span>
          </label>
          {!state.success && state.errors && 'showOnMenu' in state.errors && Array.isArray(state.errors.showOnMenu) && state.errors.showOnMenu.length > 0 && (
            <p className="text-xs text-destructive mt-1 ml-6">
              {state.errors.showOnMenu[0]}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 ml-6">
            Display this page in the site navigation
          </p>
        </div>

        {/* Form-level error */}
        {!state.success && state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{state.errors._form[0]}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="submit" variant="primary" fullWidth>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Delete Form */}
      <form action={deleteFormAction} className="mt-4">
        <input type="hidden" name="pageId" value={page.id} />
        
        {!deleteState.success && deleteState.errors && '_form' in deleteState.errors && Array.isArray(deleteState.errors._form) && deleteState.errors._form.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-2">
            <p className="text-xs text-destructive">{deleteState.errors._form[0]}</p>
          </div>
        )}
        
        <div className="text-destructive">
          <Button
            type="submit"
            variant="secondary"
            fullWidth
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Page
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* SEO Metadata Section */}
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-3">
          SEO Metadata
        </h3>
        <p className="text-[11px] text-muted-foreground mb-4">
          SEO settings are managed per locale in the page editor.
        </p>
        <Button
          href={`/admin/pages/${page.id}`}
          variant="secondary"
          fullWidth
        >
          Edit Content & SEO
        </Button>
      </div>
    </div>
  );
}
