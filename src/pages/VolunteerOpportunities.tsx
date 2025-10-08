import React, { useState, useCallback } from "react";
import { Search, Award, Clock, Users, Globe } from "lucide-react";
import { Card } from "../components/ui/Card";
import { VolunteerApplicationForm } from "../components/volunteer/VolunteerApplicationForm";
import { useTranslation } from "@/hooks/useTranslation";
import { WorkLanguage } from "@/types/volunteer";
import { useToast } from "@/contexts/ToastContext";

interface Opportunity {
  id: number;
  title: string;
  organization: string;
  description: string;
  skills: string[];
  commitment: string;
  location: string;
  type: "onsite" | "remote" | "hybrid";
  workLanguage: WorkLanguage;
  image: string;
}

const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 1,
    title: "Web Development for Education Platform",
    organization: "Global Education Initiative",
    description:
      "Help build an educational platform for underprivileged students. Looking for React and Node.js developers.",
    skills: ["React", "Node.js", "TypeScript"],
    commitment: "5-10 hours/week",
    location: "Remote",
    type: "remote",
    workLanguage: WorkLanguage.ENGLISH,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800",
  },
  {
    id: 2,
    title: "Environmental Data Analysis",
    organization: "EcoWatch Foundation",
    description:
      "Analyze environmental data to help track climate change impact. Need experience with data analysis and visualization.",
    skills: ["Python", "Data Analysis", "Visualization"],
    commitment: "8 hours/week",
    location: "Hybrid - New York",
    type: "hybrid",
    workLanguage: WorkLanguage.ENGLISH,
    image:
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800",
  },
  {
    id: 3,
    title: "Community Health App Development",
    organization: "HealthBridge NGO",
    description:
      "Create a mobile app for community health workers. Seeking mobile developers with React Native experience.",
    skills: ["React Native", "Mobile Development"],
    commitment: "15 hours/week",
    location: "Remote",
    type: "remote",
    workLanguage: WorkLanguage.SPANISH,
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800",
  },
  {
    id: 4,
    title: "Translation Services for Medical Documents",
    organization: "Doctors Without Borders",
    description:
      "Help translate medical documents and patient information. Fluency in both English and Spanish required.",
    skills: ["Translation", "Medical Terminology", "Spanish"],
    commitment: "10 hours/week",
    location: "Remote",
    type: "remote",
    workLanguage: WorkLanguage.SPANISH,
    image:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800",
  },
  {
    id: 5,
    title: "Disaster Relief Coordination",
    organization: "Global Relief Initiative",
    description:
      "Assist in coordinating disaster relief efforts. German language skills needed for communication with local teams.",
    skills: ["Project Management", "Coordination", "German"],
    commitment: "20 hours/week",
    location: "Onsite - Berlin",
    type: "onsite",
    workLanguage: WorkLanguage.GERMAN,
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800",
  },
  {
    id: 6,
    title: "Educational Content Creation in Japanese",
    organization: "Global Learning Foundation",
    description:
      "Create educational content for children in Japanese. Teaching experience preferred.",
    skills: ["Content Creation", "Education", "Japanese"],
    commitment: "8 hours/week",
    location: "Remote",
    type: "remote",
    workLanguage: WorkLanguage.JAPANESE,
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800",
  },
];

const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "Data Analysis",
  "Mobile Development",
  "UI/UX",
  "Project Management",
  "Translation",
  "Content Creation",
  "Japanese",
  "Spanish",
  "German",
];
const TYPES = ["remote", "onsite", "hybrid"];
const LANGUAGES = Object.values(WorkLanguage);

const VolunteerOpportunities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { t } = useTranslation();
  const { showToast } = useToast();

  const filteredOpportunities = SAMPLE_OPPORTUNITIES.filter((opportunity) => {
    const matchesSearch =
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill =
      !selectedSkill || opportunity.skills.includes(selectedSkill);
    const matchesType = !selectedType || opportunity.type === selectedType;
    const matchesLanguage =
      !selectedLanguage || opportunity.workLanguage === selectedLanguage;

    return matchesSearch && matchesSkill && matchesType && matchesLanguage;
  });

  const handleApply = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowApplicationForm(true);
  }, []);

  const createApplyHandler = useCallback(
    (opportunity: Opportunity) => {
      return () => handleApply(opportunity);
    },
    [handleApply],
  );

  const handleApplicationClose = useCallback(() => {
    setShowApplicationForm(false);
    setSelectedOpportunity(null);
  }, []);

  const handleApplicationSuccess = useCallback(() => {
    showToast("success", "Application submitted successfully!");
    setShowApplicationForm(false);
    setSelectedOpportunity(null);
  }, [showToast]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleSkillChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedSkill(e.target.value);
    },
    [],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedType(e.target.value);
    },
    [],
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedLanguage(e.target.value);
    },
    [],
  );


  const formatLanguageName = (language: string): string => {
    return language
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("volunteer.opportunities", "Volunteer Opportunities")}
          </h1>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={t(
                  "volunteer.searchOpportunities",
                  "Search opportunities...",
                )}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={selectedSkill}
              onChange={handleSkillChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={t("volunteer.selectSkill", "Select skill")}
            >
              <option value="">{t("volunteer.allSkills", "All Skills")}</option>
              {SKILLS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={t("volunteer.selectType", "Select type")}
            >
              <option value="">{t("volunteer.allTypes", "All Types")}</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(
                    `volunteer.type.${type}`,
                    type.charAt(0).toUpperCase() + type.slice(1),
                  )}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              aria-label={t("volunteer.selectLanguage", "Select language")}
            >
              <option value="">
                {t("volunteer.allLanguages", "All Languages")}
              </option>
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {t(`language.${language}`, formatLanguageName(language))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="overflow-hidden">
              <img
                src={opportunity.image}
                alt={opportunity.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {opportunity.title}
                </h3>
                <p className="text-sm font-medium text-indigo-600 mb-2">
                  {opportunity.organization}
                </p>
                <p className="text-gray-600 mb-4">{opportunity.description}</p>

                {/* Flattened opportunity details from 4 to 3 levels */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {opportunity.commitment}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Globe className="h-4 w-4 mr-2" />
                    {t(
                      `language.${opportunity.workLanguage}`,
                      formatLanguageName(opportunity.workLanguage),
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={createApplyHandler(opportunity)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {t("volunteer.applyNow", "Apply Now")}
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t(
              "volunteer.noOpportunitiesFound",
              "No opportunities found matching your criteria.",
            )}
          </div>
        )}
      </div>

      {showApplicationForm && selectedOpportunity && (
        <VolunteerApplicationForm
          opportunityId={selectedOpportunity.id.toString()}
          opportunityTitle={selectedOpportunity.title}
          charityId="sample-charity-id"
          onClose={handleApplicationClose}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default VolunteerOpportunities;
