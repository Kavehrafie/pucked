import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/route-guard";
import { getPagesTree } from "@/lib/page";

export async function GET() {
  try {
    await requireAuth({ requireInvitation: true });
    const pagesTree = await getPagesTree();
    return NextResponse.json(pagesTree);
  } catch (error) {
    console.error("Failed to fetch pages tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages tree" },
      { status: 500 }
    );
  }
}
