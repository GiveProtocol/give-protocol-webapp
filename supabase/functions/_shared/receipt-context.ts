import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type DonationType = "one-time" | "subscription";
export type GivingType = "direct" | "cef" | "cif";

export interface DonationContext {
  charityId?: string;
  causeId?: string;
  fundId?: string;
  amountUsd: number;
  donationType: DonationType;
  givingType?: GivingType;
}

export interface ResolvedNames {
  charityName: string | null;
  causeName: string | null;
  fundName: string | null;
}

export interface HelcimReceiptFields {
  comments: string;
  invoiceNumber: string;
  lineItemDescription: string;
}

// Looks up human-readable names from database
// Never throws — returns nulls if lookups fail
// so payment is never blocked by a name lookup failure
export async function resolveNames(
  supabase: SupabaseClient,
  context: DonationContext
): Promise<ResolvedNames> {
  let charityName: string | null = null;
  let causeName: string | null = null;
  let fundName: string | null = null;

  try {
    if (context.charityId) {
      const { data } = await supabase
        .from("charity_details")
        .select("name")
        .eq("profile_id", context.charityId)
        .single();
      charityName = data?.name ?? null;
    }
  } catch (_) { /* non-blocking */ }

  try {
    if (context.causeId) {
      const { data } = await supabase
        .from("causes")
        .select("name")
        .eq("id", context.causeId)
        .single();
      causeName = data?.name ?? null;
    }
  } catch (_) { /* non-blocking */ }

  try {
    if (context.fundId) {
      // CEF table does not exist yet — stub returns null gracefully.
      // When the charitable_equity_funds (or equivalent) table is created,
      // uncomment the lookup below and update the table name.
      // const { data } = await supabase
      //   .from("charitable_equity_funds")
      //   .select("name")
      //   .eq("id", context.fundId)
      //   .single();
      // fundName = data?.name ?? null;
      fundName = null;
    }
  } catch (_) { /* non-blocking */ }

  return { charityName, causeName, fundName };
}

// Builds the three fields that go into the Helcim payload
export function buildHelcimReceiptFields(
  names: ResolvedNames,
  context: DonationContext,
  internalRef: string
): HelcimReceiptFields {

  const givingType = context.givingType ?? "direct";

  const comments = buildComments(names, givingType);
  const lineItemDescription = buildLineItemDescription(names, givingType);

  return {
    comments,
    invoiceNumber: `GP-${internalRef}`,
    lineItemDescription,
  };
}

function buildComments(
  names: ResolvedNames,
  givingType: GivingType
): string {

  const { charityName, causeName, fundName } = names;

  switch (givingType) {
    case "direct": {
      // "Charitable Donation to Red Cross — Disaster Relief"
      // "Charitable Donation to Red Cross"
      // "Charitable Donation" (fallback)
      const parts = ["Charitable Donation"];
      if (charityName) parts.push(`to ${charityName}`);
      if (causeName) parts.push(`\u2014 ${causeName}`);
      return parts.join(" ");
    }

    case "cef": {
      // "Charitable Equity Fund — Education Endowment (UNICEF)"
      // "Charitable Equity Fund — Education Endowment"
      // "Charitable Equity Fund" (fallback)
      const parts = ["Charitable Equity Fund"];
      if (fundName) parts.push(`\u2014 ${fundName}`);
      if (charityName) parts.push(`(${charityName})`);
      return parts.join(" ");
    }

    case "cif": {
      // "Cause Impact Fund — Clean Water Initiatives"
      // "Cause Impact Fund" (fallback)
      const parts = ["Cause Impact Fund"];
      if (causeName) parts.push(`\u2014 ${causeName}`);
      return parts.join(" ");
    }

    default:
      return "Charitable Contribution — Give Protocol";
  }
}

function buildLineItemDescription(
  names: ResolvedNames,
  givingType: GivingType
): string {

  const { charityName, causeName, fundName } = names;

  switch (givingType) {
    case "direct":
      // "Direct Donation | Red Cross | Disaster Relief"
      return ["Direct Donation", charityName, causeName]
        .filter(Boolean)
        .join(" | ");

    case "cef":
      // "CEF Contribution | Education Endowment | UNICEF"
      return ["CEF Contribution", fundName, charityName]
        .filter(Boolean)
        .join(" | ");

    case "cif":
      // "CIF Contribution | Clean Water Initiatives"
      return ["CIF Contribution", causeName]
        .filter(Boolean)
        .join(" | ");

    default:
      return "Charitable Contribution";
  }
}
