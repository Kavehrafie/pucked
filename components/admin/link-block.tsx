import type { ComponentConfig } from "@measured/puck";

export const LinkBlock: ComponentConfig<{
  href: string;
  label: string;
  openInNewTab?: boolean;
}> = {
  fields: {
    href: { type: "text" },
    label: { type: "text" },
    openInNewTab: { type: "checkbox" },
  },
  defaultProps: {
    href: "#",
    label: "Link",
    openInNewTab: false,
  },
  render: ({ href, label, openInNewTab }) => {
    return (
      <a
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    );
  },
};
