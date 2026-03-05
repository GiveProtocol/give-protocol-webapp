import React from "react";
import {
  CausePageTemplate,
} from "@/components/charity/CausePageTemplate";
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
  problem:
    "Globally, 250 million children are out of school, and millions more attend under-resourced classrooms without trained teachers or basic learning materials. In Southeast Asia, poverty and geographic isolation deny entire generations the education they deserve.",
  solution:
    "The Education Access Program builds schools, trains teachers, and distributes learning resources in underserved communities. Our holistic approach combines infrastructure with innovative pedagogy, ensuring every child receives quality education that opens doors to opportunity.",
  impact: [
    "Provided education to 5,000+ children",
    "Built 20 new classrooms",
    "Trained 200 teachers",
    "Distributed 10,000 educational resources",
  ],
  impactStats: [
    { value: "5,000+", label: "Children Educated", icon: "GraduationCap" },
    { value: "20", label: "Classrooms Built", icon: "School" },
    { value: "200", label: "Teachers Trained", icon: "Users" },
    { value: "10,000", label: "Resources Distributed", icon: "BookOpen" },
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
