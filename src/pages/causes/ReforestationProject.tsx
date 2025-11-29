import React from "react";
import {
  CausePageTemplate,
} from "@/components/charity/CausePageTemplate";
import { CauseProfileData } from "@/types/charity";

const causeData: CauseProfileData = {
  id: "3",
  name: "Reforestation Project",
  description:
    "Restoring forest ecosystems and biodiversity through community-led reforestation initiatives and sustainable land management practices.",
  targetAmount: 100000,
  raisedAmount: 60000,
  charityId: "3",
  category: "Environment",
  image:
    "https://images.unsplash.com/photo-1498925008800-019c7d59d903?auto=format&fit=crop&w=800",
  impact: [
    "Planted 100,000+ native trees",
    "Restored 500 hectares of forest",
    "Protected 50 endangered species",
    "Engaged 1,000 local community members",
  ],
  timeline: "2024-2025",
  location: "Amazon Rainforest",
  partners: [
    "Climate Action Now",
    "Indigenous Communities",
    "Environmental Scientists",
    "Local Conservation Groups",
  ],
};

const ReforestationProject: React.FC = () => {
  return <CausePageTemplate cause={causeData} />;
};

export default ReforestationProject;
