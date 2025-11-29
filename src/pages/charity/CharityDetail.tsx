import React from "react";
import { useParams } from "react-router-dom";
import {
  CharityPageTemplate,
  CharityProfileData,
} from "@/components/charity/CharityPageTemplate";

/**
 * Dynamic charity detail page that loads charity data based on URL parameter.
 * Currently uses sample data - should be replaced with actual API call.
 */
const CharityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Sample data - replace with actual API call using the id parameter
  const charityData: CharityProfileData = {
    id: id ?? "unknown",
    walletAddress: "0x537f232A75F59F3CAbeBf851E0810Fc95F42aa75",
    name: "Ocean Conservation Alliance",
    description:
      "Protecting marine ecosystems and promoting sustainable ocean practices through innovative conservation programs, research initiatives, and community engagement.",
    category: "Environmental",
    image:
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800",
    verified: true,
    country: "United States",
    stats: {
      totalDonated: 750000,
      donorCount: 1250,
      projectsCompleted: 15,
    },
    mission:
      "Our mission is to protect and restore ocean ecosystems through science-based conservation actions, policy advocacy, and public education.",
    impact: [
      "Protected over 100,000 acres of marine habitat",
      "Rescued and rehabilitated 500+ marine animals",
      "Removed 50 tons of plastic waste from oceans",
      "Educated 10,000 students about marine conservation",
    ],
  };

  return <CharityPageTemplate charity={charityData} />;
};

export default CharityDetail;
