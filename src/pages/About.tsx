import React from 'react';
import { Users, Target, Heart, Shield, Globe, TrendingUp } from 'lucide-react';
import { StaticPageLayout } from '@/components/layout/StaticPageLayout';

export const About: React.FC = () => {
  return (
    <StaticPageLayout 
      title="About Give Protocol"
      subtitle="Revolutionizing charitable giving through blockchain technology"
    >
      <div className="space-y-16">
        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <Target className="h-8 w-8 text-indigo-600 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To revolutionize charitable giving by leveraging blockchain technology, ensuring transparency, 
                efficiency, and lasting impact for both donors and charitable organizations.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <Globe className="h-8 w-8 text-indigo-600 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where every charitable donation creates maximum impact through transparent, 
                efficient, and sustainable giving mechanisms.
              </p>
            </div>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Heart className="h-10 w-10 text-indigo-600 bg-indigo-100 rounded-full p-6 w-20 h-20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Direct Donations</h3>
              <p className="text-gray-600">
                Enable cryptocurrency donations directly to verified charitable organizations with complete transparency.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-10 w-10 text-indigo-600 bg-indigo-100 rounded-full p-6 w-20 h-20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Connection</h3>
              <p className="text-gray-600">
                Connect volunteers with meaningful opportunities and track verified volunteer hours on the blockchain.
              </p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-10 w-10 text-indigo-600 bg-indigo-100 rounded-full p-6 w-20 h-20 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Funds</h3>
              <p className="text-gray-600">
                Support multiple organizations in the same sector through diversified giving portfolios.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-gray-50 rounded-lg p-8 grid md:grid-cols-2 gap-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center md:col-span-2">Our Values</h2>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-indigo-600 mr-3" />
              Transparency
            </h3>
            <p className="text-gray-600">
              Every donation and volunteer hour is recorded on the blockchain, providing unprecedented 
              transparency in charitable giving.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 text-indigo-600 mr-3" />
              Impact
            </h3>
            <p className="text-gray-600">
              We focus on measurable outcomes and ensure that every contribution creates meaningful, 
              lasting change in communities worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-indigo-600 mr-3" />
              Community
            </h3>
            <p className="text-gray-600">
              Building a global community of donors, volunteers, and organizations working together 
              for positive social change.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 text-indigo-600 mr-3" />
              Innovation
            </h3>
            <p className="text-gray-600">
              Leveraging cutting-edge blockchain technology to solve traditional challenges 
              in charitable giving and volunteer coordination.
            </p>
          </div>
        </section>

        {/* The Technology */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built on Blockchain</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              Give Protocol is built on the Moonbeam Network, providing the security and transparency 
              of blockchain technology while maintaining accessibility for users and organizations.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Smart Contracts</h4>
                <p className="text-gray-600">Automated, transparent execution of donations and volunteer agreements</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Immutable Records</h4>
                <p className="text-gray-600">Permanent, tamper-proof record of all charitable activities</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Decentralized Governance</h4>
                <p className="text-gray-600">Community-driven decision making for platform development</p>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="text-center bg-indigo-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the Future of Giving</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a donor looking to make an impact, a volunteer ready to contribute your time, 
            or an organization seeking support, Give Protocol provides the tools you need to create 
            meaningful change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Start Giving
            </button>
            <button className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Find Opportunities
            </button>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default About;