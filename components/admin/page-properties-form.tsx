"use client";

import { useActionState } from "react";
import { Button } from "@measured/puck";
import { Trash2, Save } from "lucide-react";
import { updatePageAction, deletePageAction } from "@/app/actions";
import { Page } from "@/db/schema";

interface PagePropertiesFormProps {
  page: Page;
}

const initialState = {
  success: false,
  errors: {}
};

export function PagePropertiesForm({ page }: PagePropertiesFormProps) {
  const [state, formAction] = useActionState(updatePageAction as any, initialState);
  const [deleteState, deleteFormAction] = useActionState(deletePageAction as any, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Page ID */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "var(--puck-font-size-xxs)",
            fontWeight: 500,
            color: "var(--puck-color-grey-05)",
            marginBottom: "4px"
          }}
        >
          Page ID
        </label>
        <input
          type="text"
          value={page.id}
          disabled
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid var(--puck-color-grey-09)",
            background: "var(--puck-color-grey-11)",
            color: "var(--puck-color-grey-05)",
            fontSize: "var(--puck-font-size-xxs)",
            cursor: "not-allowed"
          }}
        />
      </div>

      {/* Title Form */}
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <input type="hidden" name="pageId" value={page.id} />

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            style={{
              display: "block",
              fontSize: "var(--puck-font-size-xxs)",
              fontWeight: 500,
              color: "var(--puck-color-black)",
              marginBottom: "4px"
            }}
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
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: !state.success && state.errors && 'title' in state.errors
                ? "1px solid var(--puck-color-red-06)"
                : "1px solid var(--puck-color-grey-08)",
              fontSize: "var(--puck-font-size-xxs)",
              background: "var(--puck-color-white)",
              color: "var(--puck-color-black)"
            }}
          />
          {!state.success && state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
            <p style={{ fontSize: "12px", color: "var(--puck-color-red-06)", marginTop: "4px" }}>
              {state.errors.title[0]}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            style={{
              display: "block",
              fontSize: "var(--puck-font-size-xxs)",
              fontWeight: 500,
              color: "var(--puck-color-black)",
              marginBottom: "4px"
            }}
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
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "4px",
              border: !state.success && state.errors && 'slug' in state.errors
                ? "1px solid var(--puck-color-red-06)"
                : "1px solid var(--puck-color-grey-08)",
              fontSize: "var(--puck-font-size-xxs)",
              background: "var(--puck-color-white)",
              color: "var(--puck-color-black)"
            }}
          />
          {!state.success && state.errors && 'slug' in state.errors && Array.isArray(state.errors.slug) && state.errors.slug.length > 0 && (
            <p style={{ fontSize: "12px", color: "var(--puck-color-red-06)", marginTop: "4px" }}>
              {state.errors.slug[0]}
            </p>
          )}
          <p style={{ fontSize: "11px", color: "var(--puck-color-grey-05)", marginTop: "4px" }}>
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        {/* Draft Status */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "var(--puck-font-size-xxs)",
              color: "var(--puck-color-black)"
            }}
          >
            <input
              type="checkbox"
              name="isDraft"
              defaultChecked={page.isDraft}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer"
              }}
            />
            <span>Draft (unpublished)</span>
          </label>
          <p style={{ fontSize: "11px", color: "var(--puck-color-grey-05)", marginTop: "4px", marginLeft: "24px" }}>
            Draft pages are not visible to visitors
          </p>
        </div>

        {/* Show on Menu */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "var(--puck-font-size-xxs)",
              color: "var(--puck-color-black)"
            }}
          >
            <input
              type="checkbox"
              name="showOnMenu"
              defaultChecked={page.showOnMenu}
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer"
              }}
            />
            <span>Show in navigation menu</span>
          </label>
          <p style={{ fontSize: "11px", color: "var(--puck-color-grey-05)", marginTop: "4px", marginLeft: "24px" }}>
            Display this page in the site navigation
          </p>
        </div>

        {/* Form-level error */}
        {!state.success && state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
          <div
            style={{
              padding: "12px",
              borderRadius: "4px",
              background: "var(--puck-color-red-02)",
              border: "1px solid var(--puck-color-red-06)"
            }}
          >
            <p style={{ fontSize: "var(--puck-font-size-xxs)", color: "var(--puck-color-red-06)" }}>
              {state.errors._form[0]}
            </p>
          </div>
        )}

        {/* Success message */}
        {state.success && (
          <div
            style={{
              padding: "12px",
              borderRadius: "4px",
              background: "var(--puck-color-green-02)",
              border: "1px solid var(--puck-color-green-06)"
            }}
          >
            <p style={{ fontSize: "var(--puck-font-size-xxs)", color: "var(--puck-color-green-06)" }}>
              Page updated successfully!
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          type="submit"
          variant="primary"
          icon={<Save style={{ width: "14px", height: "14px" }} />}
          fullWidth
        >
          Save Changes
        </Button>
      </form>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--puck-color-grey-09)", margin: "8px 0" }} />

      {/* Delete Section */}
      <div>
        <h3
          style={{
            fontSize: "var(--puck-font-size-xxs)",
            fontWeight: 600,
            color: "var(--puck-color-black)",
            marginBottom: "8px"
          }}
        >
          Danger Zone
        </h3>
        <p style={{ fontSize: "11px", color: "var(--puck-color-grey-05)", marginBottom: "12px" }}>
          Once you delete a page, there is no going back. Please be certain.
        </p>
        <form action={deleteFormAction}>
          <input type="hidden" name="pageId" value={page.id} />
          <Button
            type="submit"
            variant="secondary"
            icon={<Trash2 style={{ width: "14px", height: "14px" }} />}
            fullWidth
            onClick={(e) => {
              if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
                e.preventDefault();
              }
            }}
          >
            Delete Page
          </Button>
        </form>
      </div>

      {/* SEO Metadata Section */}
      <div style={{ borderTop: "1px solid var(--puck-color-grey-09)", margin: "8px 0", paddingTop: "16px" }}>
        <h3
          style={{
            fontSize: "var(--puck-font-size-xxs)",
            fontWeight: 600,
            color: "var(--puck-color-black)",
            marginBottom: "12px"
          }}
        >
          SEO Metadata
        </h3>
        <p style={{ fontSize: "11px", color: "var(--puck-color-grey-05)", marginBottom: "16px" }}>
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
