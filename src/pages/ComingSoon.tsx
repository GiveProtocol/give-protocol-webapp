import React, { useState, useCallback } from "react";
import { Eye, Zap, TrendingUp, Infinity } from "lucide-react";
import { Logger } from "@/utils/logger";

const ComingSoon: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim() || !email.includes("@")) {
        setErrorMessage("Please enter a valid email address");
        setStatus("error");
        return;
      }

      setStatus("loading");
      try {
        // Call the MailChimp API endpoint
        const response = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to subscribe");
        }

        setStatus("success");
        setEmail("");
      } catch (err) {
        Logger.error("Subscription error", { error: err });
        setStatus("error");
        setErrorMessage("Failed to join waitlist. Please try again.");
      }
    },
    [email],
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (status === "error") {
        setStatus("idle");
        setErrorMessage("");
      }
    },
    [status],
  );

  return (
    <div className="min-h-screen bg-background-primary relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Combined Animated Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.1),transparent_50%)] animate-pulse" />

      {/* Hero Section */}
      <main className="py-16 sm:py-24 text-center">
        <div className="mb-8">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 animate-fade-in">
            Launching Q1 2026
          </span>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
          The Future of
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Transparent Giving
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
          Join the waitlist for pre-launch access
          <span className="block font-semibold text-gray-800 mt-2">
            Transform how charities sustain impact
          </span>
        </p>

        {/* Email Form */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-md mx-auto animate-fade-in-up animation-delay-400"
        >
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email for pre-launch access"
            className="w-full px-4 py-3 rounded-lg border border-indigo-200 bg-indigo-100 text-indigo-800 placeholder:text-indigo-600/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 focus:outline-none hover:border-indigo-300"
            disabled={status === "loading" || status === "success"}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={`absolute right-2 top-2 px-4 py-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              status === "loading"
                ? "bg-gray-100 cursor-wait"
                : status === "success"
                  ? "bg-green-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800"
            }`}
          >
            Join Waitlist
          </button>
        </form>

        {status === "success" && (
          <p className="mt-2 text-green-600 text-center">
            Thanks for joining! We&apos;ll keep you updated.
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-red-600 text-center">{errorMessage}</p>
        )}
      </main>

      {/* Features Preview */}
      <section className="mt-16 mb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <article className="group p-6 bg-gradient-to-br from-white/70 to-indigo-50/30 backdrop-blur-sm rounded-xl border border-indigo-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mx-auto">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
            Transparent
          </h3>
          <p className="text-gray-600">
            Track your impact with blockchain-verified donations
          </p>
        </article>
        <article className="group p-6 bg-gradient-to-br from-white/70 to-purple-50/30 backdrop-blur-sm rounded-xl border border-purple-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mx-auto">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
            Efficient
          </h3>
          <p className="text-gray-600">
            Smart contracts ensure funds reach their destination
          </p>
        </article>
        <article className="group p-6 bg-gradient-to-br from-white/70 to-indigo-50/30 backdrop-blur-sm rounded-xl border border-indigo-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mx-auto">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
            Impactful
          </h3>
          <p className="text-gray-600">
            Maximize your giving through innovative DeFi strategies
          </p>
        </article>
        <article className="group p-6 bg-gradient-to-br from-white/70 to-purple-50/30 backdrop-blur-sm rounded-xl border border-purple-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mx-auto">
            <Infinity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
            Sustainable
          </h3>
          <p className="text-gray-600">
            Creating the rails for perpetual funding for charities
          </p>
        </article>
      </section>
    </div>
  );
};

export default ComingSoon;
