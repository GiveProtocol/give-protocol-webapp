import React from "react";
import { CausePageTemplate } from "@/components/charity/CausePageTemplate";
import { CauseProfileData } from "@/types/charity";

const causeData: CauseProfileData = {
  id: "2",
  name: "Education Access Program",
  description:
    "Ensuring quality education for underprivileged children through innovative learning programs, teacher training, and infrastructure development.",
  targetAmount: 75000,
  raisedAmount: 45000,
  charityId: "2",
  category: "Education",
  image:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800",
  impact: [
    "Provided education to 5,000+ children",
    "Built 20 new classrooms",
    "Trained 200 teachers",
    "Distributed 10,000 educational resources",
  ],
  timeline: "2024-2025",
  location: "Southeast Asia",
  partners: [
    "Education for All",
    "Local Schools",
    "Teaching Volunteers",
    "Ministry of Education",
  ],
};

const EducationAccessProgram: React.FC = () => {
  return <CausePageTemplate cause={causeData} />;
};

export default EducationAccessProgram;
