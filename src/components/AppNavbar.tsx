import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { ConnectButton } from "./web3/ConnectButton";
import { SettingsMenu } from "./SettingsMenu";
import { Menu, X, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { DOCS_CONFIG } from "@/config/docs";

// Desktop navigation links component
const DesktopNavLinks: React.FC<{
  isLimitedNavPage: boolean;
  isActive: (_path: string) => string;
  userType: string | null;
  handleDashboardClick: () => void;
  t: (_key: string) => string;
}> = ({ isLimitedNavPage, isActive, userType, handleDashboardClick, t }) => {
  if (isLimitedNavPage) {
    return (
      <>
        <Link
          to="/about"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive("/about")}`}
        >
          {t("nav.about")}
        </Link>
        <a
          href={DOCS_CONFIG.url}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-gray-700 hover:bg-primary-50"
        >
          {t("nav.docs")}
        </a>
        <Link
          to="/legal"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive("/legal")}`}
        >
          {t("nav.legal")}
        </Link>
        <Link
          to="/privacy"
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive("/privacy")}`}
        >
          Privacy
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        to="/browse"
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${isActive("/browse")}`}
      >
        {t("nav.browse")}
      </Link>
      <Link
        to="/opportunities"
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${isActive("/opportunities")}`}
      >
        {t("nav.opportunities")}
      </Link>
      <Link
        to="/contributions"
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${isActive("/contributions")}`}
      >
        {t("nav.contributions")}
      </Link>
      <button
        onClick={handleDashboardClick}
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${
          isActive("/give-dashboard") || isActive("/charity-portal")
        }`}
      >
        {t("nav.dashboard")}
      </button>
      {userType === "donor" && (
        <Link
          to="/scheduled-donations"
          className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${isActive("/scheduled-donations")}`}
        >
          Monthly Donations
        </Link>
      )}
      <Link
        to="/governance"
        className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-center ${isActive("/governance")}`}
      >
        {t("nav.governance")}
      </Link>
    </>
  );
};

// Mobile navigation links component
const MobileNavLinks: React.FC<{
  isLimitedNavPage: boolean;
  isActive: (_path: string) => string;
  userType: string | null;
  handleDashboardClick: () => void;
  handleLinkClick: () => void;
  t: (_key: string) => string;
}> = ({
  isLimitedNavPage,
  isActive,
  userType,
  handleDashboardClick,
  handleLinkClick,
  t,
}) => {
  const handleDashboardAndClose = useCallback(() => {
    handleLinkClick();
    handleDashboardClick();
  }, [handleLinkClick, handleDashboardClick]);

  if (isLimitedNavPage) {
    return (
      <>
        <Link
          to="/about"
          className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/about")}`}
          onClick={handleLinkClick}
        >
          {t("nav.about")}
        </Link>
        <a
          href={DOCS_CONFIG.url}
          className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-primary-50"
          onClick={handleLinkClick}
        >
          {t("nav.docs")}
        </a>
        <Link
          to="/legal"
          className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/legal")}`}
          onClick={handleLinkClick}
        >
          {t("nav.legal")}
        </Link>
        <Link
          to="/privacy"
          className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/privacy")}`}
          onClick={handleLinkClick}
        >
          Privacy
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        to="/browse"
        className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/browse")}`}
        onClick={handleLinkClick}
      >
        {t("nav.browse")}
      </Link>
      <Link
        to="/opportunities"
        className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/opportunities")}`}
        onClick={handleLinkClick}
      >
        {t("nav.opportunities")}
      </Link>
      <Link
        to="/contributions"
        className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/contributions")}`}
        onClick={handleLinkClick}
      >
        {t("nav.contributions")}
      </Link>
      <button
        onClick={handleDashboardAndClose}
        className={`block w-full text-left px-3 py-3 rounded-md text-base font-medium ${
          isActive("/give-dashboard") || isActive("/charity-portal")
        }`}
      >
        {t("nav.dashboard")}
      </button>
      {userType === "donor" && (
        <Link
          to="/scheduled-donations"
          className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive("/scheduled-donations")}`}
          onClick={handleLinkClick}
        >
          <Calendar className="h-4 w-4 mr-1" />
          <span>Monthly Donations</span>
        </Link>
      )}
      <Link
        to="/governance"
        className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/governance")}`}
        onClick={handleLinkClick}
      >
        {t("nav.governance")}
      </Link>
    </>
  );
};

// Mobile menu wrapper to reduce nesting
const MobileMenu: React.FC<{
  isMenuOpen: boolean;
  children: React.ReactNode;
}> = ({ isMenuOpen, children }) => {
  if (!isMenuOpen) return null;

  return (
    <nav className="md:hidden" id="mobile-menu" aria-label="Mobile navigation">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg">
        {children}
      </div>
    </nav>
  );
};

// Mobile menu button component
const MobileMenuButton: React.FC<{
  isMenuOpen: boolean;
  toggleMenu: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}> = ({ isMenuOpen, toggleMenu, menuButtonRef }) => (
  <button
    ref={menuButtonRef}
    type="button"
    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
    aria-controls="mobile-menu"
    aria-expanded={isMenuOpen}
    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
    onClick={toggleMenu}
  >
    {isMenuOpen ? (
      <X className="block h-6 w-6" aria-hidden="true" />
    ) : (
      <Menu className="block h-6 w-6" aria-hidden="true" />
    )}
  </button>
);

// Nav header component to reduce nesting
const NavHeader: React.FC = () => (
  <Link to="/" className="flex items-center" aria-label="Give Protocol home">
    <Logo className="h-8 w-8" />
  </Link>
);

// Nav actions component
const NavActions: React.FC<{
  isMenuOpen: boolean;
  toggleMenu: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement>;
}> = ({ isMenuOpen, toggleMenu, menuButtonRef }) => (
  <div className="flex items-center space-x-2">
    <SettingsMenu />
    <ConnectButton />
    <MobileMenuButton
      isMenuOpen={isMenuOpen}
      toggleMenu={toggleMenu}
      menuButtonRef={menuButtonRef}
    />
  </div>
);

export const AppNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { userType } = useAuth();

  // Check if current page should only show limited navigation
  const isLimitedNavPage = useMemo(
    () =>
      ["/about", "/legal", "/privacy", "/governance"].includes(
        location.pathname,
      ),
    [location.pathname],
  );

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path
        ? "bg-primary-100 text-primary-900"
        : "text-gray-700 hover:bg-primary-50",
    [location.pathname],
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleLinkClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
    }
  }, []);

  // Handle dashboard navigation based on user type
  const handleDashboardClick = useCallback(() => {
    if (userType === "admin") {
      navigate("/admin");
    } else if (userType === "charity") {
      navigate("/charity-portal");
    } else {
      navigate("/give-dashboard");
    }
  }, [userType, navigate]);

  return (
    <nav
      className="bg-background-primary border-b border-gray-200 shadow-sm"
      aria-label="Application navigation"
    >
      <div
        className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16"
        onKeyDown={handleKeyDown}
        role="menubar"
        tabIndex={0}
      >
        <div className="flex items-center">
          <NavHeader />
          <div className="hidden md:ml-6 md:flex md:gap-6">
            <DesktopNavLinks
              isLimitedNavPage={isLimitedNavPage}
              isActive={isActive}
              userType={userType}
              handleDashboardClick={handleDashboardClick}
              t={t}
            />
          </div>
        </div>
        <NavActions
          isMenuOpen={isMenuOpen}
          toggleMenu={toggleMenu}
          menuButtonRef={menuButtonRef}
        />
      </div>

      {/* Mobile menu */}
      <MobileMenu isMenuOpen={isMenuOpen}>
        <MobileNavLinks
          isLimitedNavPage={isLimitedNavPage}
          isActive={isActive}
          userType={userType}
          handleDashboardClick={handleDashboardClick}
          handleLinkClick={handleLinkClick}
          t={t}
        />
      </MobileMenu>
    </nav>
  );
};
