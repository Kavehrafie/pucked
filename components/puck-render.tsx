"use client";

import { Render } from "@measured/puck";
import { getConfig } from "@/puck.config";
import type { PuckData } from "@/types/puck";

interface PuckRenderProps {
  data: PuckData;
  locale: string;
}

export function PuckRender({ data, locale }: PuckRenderProps) {
  const config = getConfig(locale);

  return <Render data={data} config={config} />;
}
