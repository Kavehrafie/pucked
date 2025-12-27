import type { Config } from "@measured/puck";
import { GuestTemplate } from "./components/guest-template";
import type { ComponentProps, RootProps } from "@/types/puck";

export const config: Config<ComponentProps, RootProps> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
        level: { type: "select", 
            options: [
                { label: "H1", value: 1 },
                { label: "H2", value: 2 },
                { label: "H3", value: 3 },
                { label: "H4", value: 4 },
                { label: "H5", value: 5 },
            ]
         },
      },
      defaultProps: {
        title: "Heading",
      },
      render: ({ title }) => (        
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
        </div>
      ),
    },
  },
  root: {
    render: ({ children }) => <GuestTemplate>{children}</GuestTemplate>,
  }
};

export default config;