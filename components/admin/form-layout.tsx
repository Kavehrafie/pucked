import { ReactNode } from "react";

export const FormSection = ({
  heading, children,
}: {
  heading: ReactNode;
  children: React.ReactNode;
}) => (
  <>
    <section
      className="@xl:grid border @xl:p-6 rounded-lg bg-white overflow-hidden shadow-sm"
      style={{ gridTemplateColumns: "1fr 3fr", gap: "2rem" }}
    >
      <div className="">{heading}</div>
      <div className="mt-4 @xl:mt-0 p-4 @xl:p-0">{children}</div>
    </section>
  </>
);
export const HeadingSection = ({
  title, description,
}: {
  title: string;
  description?: string;
}) => (
  <>
    <h3 className="text-lg font-semibold text-foreground bg-gray-100 @xl:bg-white p-3 border-b @xl:p-0 @xl:border-none">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground mt-1 hidden @xl:block">
      {description}
    </p>
  </>
);
