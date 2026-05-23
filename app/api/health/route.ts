import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function has(v: string | undefined) {
  return Boolean(v && v.trim().length > 0);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase_url: has(process.env.SUPABASE_URL) ? "set" : "missing",
    supabase_service_role_key: has(process.env.SUPABASE_SERVICE_ROLE_KEY)
      ? "set"
      : "missing",
    hotpepper_api_key: has(process.env.HOTPEPPER_API_KEY) ? "set" : "missing",
  });
}
