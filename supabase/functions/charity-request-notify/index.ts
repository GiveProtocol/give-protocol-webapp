/**
 * Supabase Edge Function: charity-request-notify
 * @module charity-request-notify
 * @description Sends an email to the platform admin distribution list
 * whenever a donor requests an unclaimed charity. Invoked by the
 * trg_charity_requests_notify trigger via pg_net after a row is inserted
 * into charity_requests.
 *
 * Required env:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - RESEND_API_KEY            (optional; if missing the function no-ops)
 *   - ADMIN_ALERT_EMAIL         (optional; defaults to support@giveprotocol.io)
 * @version 1
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_ADMIN_EMAIL = "support@giveprotocol.io";
const ADMIN_REVIEW_URL = "https://giveprotocol.io/admin/charity-requests";

interface NotifyRequest {
  requestId: string;
  ein: string;
  userId: string | null;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(text: string): string {
  return text.replace(/[<>&]/g, (char) => {
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    return "&amp;";
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_ALERT_EMAIL") ?? DEFAULT_ADMIN_EMAIL;

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(
      { success: false, error: "Server configuration error" },
      503,
    );
  }

  // The trigger calls us with the service role key in the Authorization
  // header. Verify it before doing any work.
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${supabaseServiceKey}`) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  const reqObj = body as Record<string, unknown>;
  if (typeof reqObj.requestId !== "string" || typeof reqObj.ein !== "string") {
    return jsonResponse(
      { success: false, error: "Missing required fields: requestId, ein" },
      400,
    );
  }

  const payload: NotifyRequest = {
    requestId: reqObj.requestId,
    ein: reqObj.ein,
    userId: typeof reqObj.userId === "string" ? reqObj.userId : null,
  };

  if (!resendApiKey) {
    console.warn(
      "RESEND_API_KEY not configured — skipping charity request email",
    );
    return jsonResponse(
      { success: true, skipped: true, reason: "resend_not_configured" },
      200,
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Look up requester email and total request count for this EIN
  let requesterEmail: string | null = null;
  if (payload.userId) {
    const { data: userData } = await supabase.auth.admin.getUserById(
      payload.userId,
    );
    requesterEmail = userData.user?.email ?? null;
  }

  const { count: requestCount } = await supabase
    .from("charity_requests")
    .select("id", { count: "exact", head: true })
    .eq("ein", payload.ein);

  const safeEin = escapeHtml(payload.ein);
  const safeRequester = requesterEmail
    ? escapeHtml(requesterEmail)
    : "(anonymous user)";
  const totalRequests = requestCount ?? 1;

  const subject = `New charity request: EIN ${safeEin}`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;">
  <div style="background:#10b981;padding:20px;border-radius:8px 8px 0 0;">
    <h1 style="color:white;margin:0;font-size:20px;">Give Protocol — Admin Alert</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <h2 style="color:#111827;">New unclaimed charity request</h2>
    <p>A donor has asked us to reach out to an unclaimed charity.</p>
    <ul>
      <li><strong>EIN:</strong> ${safeEin}</li>
      <li><strong>Requester:</strong> ${safeRequester}</li>
      <li><strong>Total requests for this EIN:</strong> ${totalRequests}</li>
    </ul>
    <p>
      <a href="${ADMIN_REVIEW_URL}" style="background:#10b981;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">
        Review charity requests
      </a>
    </p>
  </div>
</body>
</html>`;

  const sendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Give Protocol <notifications@giveprotocol.io>",
      to: [adminEmail],
      subject,
      html,
    }),
  });

  if (!sendResponse.ok) {
    const errText = await sendResponse.text();
    console.error(`Resend API error ${sendResponse.status}:`, errText);
    return jsonResponse(
      { success: false, error: "Email delivery failed" },
      500,
    );
  }

  const sendResult = (await sendResponse.json()) as Record<string, unknown>;
  console.log(
    `Charity request alert sent to ${adminEmail} for EIN ${payload.ein}, emailId:`,
    sendResult.id,
  );

  return jsonResponse({ success: true, emailId: sendResult.id }, 200);
});
