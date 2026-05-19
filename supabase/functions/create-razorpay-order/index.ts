import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Razorpay order creation Edge Function
// Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from Supabase project secrets.
// Call: POST /functions/v1/create-razorpay-order
// Body: { amount_inr: number, order_id: string, currency?: string }

const RAZORPAY_API = "https://api.razorpay.com/v1/orders";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const keyId     = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    const { amount_inr, order_id, currency = "INR" } = await req.json();

    if (!amount_inr || !order_id) {
      return new Response(
        JSON.stringify({ error: "amount_inr and order_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    // Razorpay expects amount in paise (1 INR = 100 paise)
    const amountPaise = Math.round(amount_inr * 100);

    const credentials = btoa(`${keyId}:${keySecret}`);

    const rzpRes = await fetch(RAZORPAY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: order_id.slice(0, 40), // Razorpay receipt max 40 chars
        notes: { visit_order_id: order_id },
      }),
    });

    if (!rzpRes.ok) {
      const errBody = await rzpRes.text();
      return new Response(
        JSON.stringify({ error: "Razorpay API error", detail: errBody }),
        { status: rzpRes.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    const rzpOrder = await rzpRes.json();

    return new Response(JSON.stringify(rzpOrder), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    );
  }
});
