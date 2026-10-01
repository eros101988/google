import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use edge runtime for faster redirects, but supabase-js works in Edge.
export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  if (!code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Cannot connect to DB, fallback or error
    return new NextResponse("System configuration error", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch NFC card by short_code
  const { data: card, error } = await supabase
    .from("nfc_cards")
    .select("id, merchant_id, destination_url, status")
    .eq("short_code", code)
    .single();

  if (error || !card) {
    return new NextResponse("此 NFC 連結目前無法使用。", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (card.status !== "active" && card.status !== "testing") {
    return new NextResponse("此 NFC 連結已被停用或遺失。", {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // 2. Log the scan event (fire and forget via Edge executionContext.waitUntil if supported, or just await it if fast)
  // For safety in standard Vercel, we'll await it. In a real heavy prod environment, we'd queue it.
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  
  // Basic debouncing could be done via a quick check or IP, but we avoid storing IP for privacy.
  // We just insert the event.
  await Promise.all([
    supabase.from("scan_events").insert({
      nfc_card_id: card.id,
      merchant_id: card.merchant_id,
      user_agent: userAgent,
      referrer: referrer,
      is_test: card.status === "testing",
    }),
    supabase.rpc("increment_scan_count", { card_id: card.id })
  ]);

  // 3. Perform 302 Redirect
  return NextResponse.redirect(card.destination_url, { status: 302 });
}
