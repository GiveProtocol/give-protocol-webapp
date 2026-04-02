import React from "react";
import { Card } from "@/components/ui/Card";
import type { CharityRecord } from "@/services/charityDataService";
import { formatNteeCode } from "@/utils/nteeMap";
import { lookupIrsCode, formatRulingYear } from "@/utils/irsCodeMaps";

interface OrgDetailsCardProps {
  charityRecord: CharityRecord;
}

/**
 * Sidebar card showing key organization details in a clean key-value layout.
 * @param props - Component props
 * @param props.charityRecord - The full charity record for this organization
 * @returns The rendered details card
 */
export const OrgDetailsCard: React.FC<OrgDetailsCardProps> = ({
  charityRecord,
}) => {
  const rows: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: "EIN", value: charityRecord.ein },
    { label: "Ruling year", value: formatRulingYear(charityRecord.ruling) },
    { label: "NTEE code", value: formatNteeCode(charityRecord.ntee_cd) },
    {
      label: "Deductibility",
      value: lookupIrsCode("deductibility", charityRecord.deductibility),
      highlight: charityRecord.deductibility === "1",
    },
    {
      label: "Affiliation",
      value: lookupIrsCode("affiliation", charityRecord.affiliation),
    },
    {
      label: "State",
      value: charityRecord.state ?? "—",
    },
  ];

  return (
    <Card hover={false} className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Organization Details
      </h3>
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-sm">
            <dt className="text-gray-500 shrink-0">{row.label}</dt>
            <dd
              className={`text-right font-medium ${
                row.highlight ? "text-emerald-700" : "text-gray-900"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
};
