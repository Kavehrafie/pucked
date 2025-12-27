"use client";

import type { ComponentConfig } from "@measured/puck";

export const TipTapBlock: ComponentConfig<{
  content: string;
}> = {
  fields: {
    content: {
      type: "textarea",
    },
  },
  defaultProps: {
    content: "",
  },
  render: ({ content }) => {
    return (
      <div
        style={{
          padding: "8px",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  },
};
