import React from "react";
import {
  CausePageTemplate,
} from "@/components/charity/CausePageTemplate";
import { CauseProfileData } from "@/types/charity";

const causeData: CauseProfileData = {
  id: "1",
  name: "Clean Water Initiative",
  description:
    "Providing clean water access to rural communities through sustainable infrastructure and community engagement.",
  targetAmount: 50000,
  raisedAmount: 25000,
  charityId: "1",
  category: "Water & Sanitation",
  image:
    "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800",
  impact: [
    "Provided clean water to 10,000+ people",
    "Built 50 sustainable water wells",
    "Trained 100 local water technicians",
    "Reduced waterborne diseases by 60%",
  ],
  timeline: "2024-2025",
  location: "East Africa",
  partners: [
    "Global Water Foundation",
    "Local Community Leaders",
    "Engineering Volunteers",
  ],
};

const CleanWaterInitiative: React.FC = () => {
  return <CausePageTemplate cause={causeData} />;
};

export default CleanWaterInitiative;
