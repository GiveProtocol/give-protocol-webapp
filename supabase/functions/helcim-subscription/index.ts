/**
 * Supabase Edge Function for creating Helcim subscriptions
 * @module helcim-subscription
 * @description Handles recurring card payments through Helcim's Subscription API.
 * Creates monthly subscriptions for recurring donations.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  checkoutToken: string;
  amount: number; // in cents
  charityId: string;
  charityName: string;
  donorName: string;
  donorEmail: string;
  coverFees: boolean;
  ipAddress?: string;
}

interface HelcimSubscriptionResponse {
  subscriptionId: string;
  customerId: string;
  status: string;
  nextBillingDate: string;
  amount: number;
}

/**
 * Validate the subscription request body
 */
function validateRequest(body: unknown): body is SubscriptionRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const req = body as Record<string, unknown>;

  return (
    typeof req.checkoutToken === "string" &&
    req.checkoutToken.length > 0 &&
    typeof req.amount === "number" &&
    req.amount > 0 &&
    typeof req.charityId === "string" &&
    req.charityId.length > 0 &&
    typeof req.charityName === "string" &&
    typeof req.donorName === "string" &&
    typeof req.donorEmail === "string" &&
    req.donorEmail.includes("@")
  );
}

/**
 * Create or get customer in Helcim
 */
async function getOrCreateCustomer(
  email: string,
  name: string,
  apiToken: string,
): Promise<string> {
  // First try to find existing customer
  const searchResponse = await fetch(
    `https://api.helcim.com/v2/customers?search=${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        "api-token": apiToken,
        accept: "application/json",
      },
    },
  );

  if (searchResponse.ok) {
    const customers = await searchResponse.json();
    if (Array.isArray(customers) && customers.length > 0) {
      return customers[0].customerCode || customers[0].id;
    }
  }

  // Create new customer
  const createResponse = await fetch("https://api.helcim.com/v2/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-token": apiToken,
      accept: "application/json",
    },
    body: JSON.stringify({
      contactName: name,
      businessName: name,
      cellPhone: "",
      email: email,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Failed to create customer:", errorText);
    throw new Error("Failed to create customer profile");
  }

  const customer = await createResponse.json();
  return customer.customerCode || customer.id;
}

/**
 * Store card on file for customer
 */
async function storeCard(
  customerId: string,
  cardToken: string,
  apiToken: string,
): Promise<string> {
  const response = await fetch(
    "https://api.helcim.com/v2/card-terminals/cards",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-token": apiToken,
        accept: "application/json",
      },
      body: JSON.stringify({
        customerCode: customerId,
        cardToken: cardToken,
        verify: true,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to store card:", errorText);
    throw new Error("Failed to store payment method");
  }

  const result = await response.json();
  return result.cardToken || result.id;
}

/**
 * Create subscription through Helcim API
 */
async function createHelcimSubscription(
  request: SubscriptionRequest,
  customerId: string,
  cardId: string,
  apiToken: string,
): Promise<HelcimSubscriptionResponse> {
  // Calculate next billing date (1 month from now)
  const nextBilling = new Date();
  nextBilling.setMonth(nextBilling.getMonth() + 1);

  const response = await fetch("https://api.helcim.com/v2/subscriptions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-token": apiToken,
      accept: "application/json",
    },
    body: JSON.stringify({
      customerCode: customerId,
      cardToken: cardId,
      amount: request.amount / 100, // Helcim expects dollars
      currency: "USD",
      frequency: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      description: `Monthly donation to ${request.charityName}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Helcim subscription error:", errorText);
    throw new Error(`Subscription creation failed: ${response.status}`);
  }

  const result = await response.json();

  return {
    subscriptionId: result.subscriptionId || result.id,
    customerId: customerId,
    status: result.status || "active",
    nextBillingDate: result.nextBillingDate || nextBilling.toISOString(),
    amount: request.amount,
  };
}

/**
 * Log subscription to Supabase database
 */
async function logSubscription(
  supabase: ReturnType<typeof createClient>,
  request: SubscriptionRequest,
  subscriptionResult: HelcimSubscriptionResponse,
): Promise<void> {
  const { error } = await supabase.from("recurring_donations").insert({
    charity_id: request.charityId,
    donor_email: request.donorEmail,
    donor_name: request.donorName,
    amount_cents: request.amount,
    currency: "USD",
    payment_method: "card",
    subscription_id: subscriptionResult.subscriptionId,
    customer_id: subscriptionResult.customerId,
    fee_covered: request.coverFees,
    frequency: "monthly",
    status: "active",
    next_billing_date: subscriptionResult.nextBillingDate,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to log subscription:", error);
    // Don't throw - subscription succeeded, logging is secondary
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();

    // Validate request
    if (!validateRequest(body)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Helcim credentials from environment
    const apiToken = Deno.env.get("HELCIM_API_TOKEN");
    const accountId = Deno.env.get("HELCIM_ACCOUNT_ID");
    const terminalId = Deno.env.get("HELCIM_TERMINAL_ID");

    if (!apiToken || !accountId || !terminalId) {
      console.error("Missing Helcim configuration");
      return new Response(
        JSON.stringify({ error: "Payment service configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get client IP for fraud prevention
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";

    const subscriptionRequest: SubscriptionRequest = {
      ...body,
      ipAddress: clientIp,
    };

    // Create or get customer
    const customerId = await getOrCreateCustomer(
      subscriptionRequest.donorEmail,
      subscriptionRequest.donorName,
      apiToken,
    );

    // Store card on file
    const cardId = await storeCard(
      customerId,
      subscriptionRequest.checkoutToken,
      apiToken,
    );

    // Create subscription through Helcim
    const subscriptionResult = await createHelcimSubscription(
      subscriptionRequest,
      customerId,
      cardId,
      apiToken,
    );

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await logSubscription(supabase, subscriptionRequest, subscriptionResult);
    }

    // Return sanitized response
    return new Response(
      JSON.stringify({
        success: true,
        subscriptionId: subscriptionResult.subscriptionId,
        customerId: subscriptionResult.customerId,
        status: subscriptionResult.status,
        nextBillingDate: subscriptionResult.nextBillingDate,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Subscription error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Subscription creation failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
