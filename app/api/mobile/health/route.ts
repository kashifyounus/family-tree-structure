import { NextResponse } from "next/server";

/** Lightweight probe for the mobile app “Test connection” action. */
export async function GET() {
  return NextResponse.json({ ok: true, service: "kinship-mobile-api" });
}
