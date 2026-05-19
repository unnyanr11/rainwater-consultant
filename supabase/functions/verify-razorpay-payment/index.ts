import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

Deno.serve(async (req) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    visit_payment_id,     // your DB row id
    order_id,             // design_orders.id
  } = await req.json();

  // Verify signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const key  = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig  = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex  = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");

  if (hex !== razorpay_signature) {
    return new Response(JSON.stringify({ success: false, error: "Invalid signature" }), { status: 400 });
  }

  // Update DB — only after verified
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await supabase.from("visit_payments").update({
    payment_ref: razorpay_payment_id,
    razorpay_order_id,
    status: "paid",
    paid_at: new Date().toISOString(),
  }).eq("id", visit_payment_id);

  await supabase.from("design_orders").update({
    status: "visit_paid",
    visit_payment_status: "paid",
  }).eq("id", order_id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});