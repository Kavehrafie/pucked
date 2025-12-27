import type { ComponentConfig } from "@measured/puck";

export const HeadingBlock: ComponentConfig<{
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}> = {
  fields: {
    title: { type: "text" },
    level: {
      type: "select",
      options: [
        { label: "H1", value: 1 },
        { label: "H2", value: 2 },
        { label: "H3", value: 3 },
        { label: "H4", value: 4 },
        { label: "H5", value: 5 },
        { label: "H6", value: 6 },
      ],
    },
  },
  defaultProps: {
    title: "Heading",
    level: 2,
  },
  render: ({ title, level }) => {
    const Tag = `h${level || 2}` as keyof JSX.IntrinsicElements;
    return <Tag>{title}</Tag>;
  },
};
