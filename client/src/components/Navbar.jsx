import React, { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/reports", label: "Reports" },
      { to: "/found", label: "Found" },
      { to: "/lost", label: "Lost" },
      { to: "/my-claims", label: "Claims" },
    ],
    []
  );

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const linkBase =
    "px-3 py-2 rounded-[12px] text-[13px] font-medium text-muted-text whitespace-nowrap hover:text-primary hover:bg-primary/5 transition-colors";
  const linkActive = "text-primary bg-primary/10";

  return (
    <nav className="sticky top-0 z-[60] border-b border-border bg-surface/80 backdrop-blur-md py-3">
      <div className="container-custom h-[--navbar-height] flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-6 min-w-[220px]">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group"
            aria-label="Go to dashboard"
          >
            <div className="w-10 h-10 bg-primary rounded-[12px] flex items-center justify-center shadow-sm text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="leading-tight hidden sm:block">
              <div className="text-[16px] font-semibold text-text">Lost & Found</div>
              <div className="text-[13px] font-semibold text-primary italic -mt-0.5">Portal</div>
            </div>
          </Link>
        </div>

        {/* Center: Primary nav (desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3 min-w-[240px] justify-end relative">
          <Link
            to="/report-lost"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-[10px] bg-primary text-white text-[13px] shadow-sm shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all  tracking-wide mr-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Report
          </Link>

          {(user.role === "ADMIN" || user.role === "STAFF") && (
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center h-10 px-4 rounded-[12px] text-[13px] font-semibold text-danger bg-danger/5 border border-danger/10 hover:bg-danger hover:text-white transition-colors"
            >
              Admin Room
            </Link>
          )}

          {/* Profile Dropdown Container */}
          <div 
            className="relative group py-2"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-10 h-10 inline-flex items-center justify-center rounded-full bg-surface border-2 border-primary/20 text-primary font-bold text-[14px] hover:ring-4 hover:ring-primary/10 transition-all ${isProfileOpen ? 'ring-4 ring-primary/20 border-primary' : ''}`}
              aria-label="User profile"
            >
              {initials?.slice(0, 1) || "U"}
            </button>

            {/* Dropdown Menu - Added pt-2 to close the gap */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full w-[280px] pt-1 origin-top-right">
                <div className="bg-white rounded-[20px] shadow-2xl border border-border overflow-hidden animate-fade-in">
                  {/* User Info Section */}
                  <div className="p-5 flex items-center gap-4 bg-primary/5">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-[16px] font-bold">
                      {initials?.slice(0, 1) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-text truncate">{user?.name}</div>
                      <div className="text-[12px] text-muted-text truncate">{user?.email}</div>
                    </div>
                  </div>

                  <div className="h-[1px] bg-border/50 mx-4" />

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold text-text hover:bg-bg transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-5 h-5 text-muted-text group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Manage account
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold text-danger hover:bg-danger/5 transition-colors group"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-[12px] bg-bg border border-border"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
            title="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-surface shadow-2xl p-6 border-l border-border transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[13px] font-semibold text-muted-text uppercase tracking-wider">
                Menu
              </div>
              <button
                className="w-9 h-9 rounded-[12px] hover:bg-primary/5 text-text"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-[12px] text-[14px] font-semibold text-text hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              <div className="h-[1px] bg-border my-4" />

              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold text-text hover:bg-bg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px]">
                  {initials?.slice(0, 1) || "U"}
                </div>
                Profile Settings
              </Link>

              {(user.role === "ADMIN" || user.role === "STAFF") && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 mt-4 rounded-[12px] bg-danger/5 text-danger font-bold text-center border border-danger/10"
                >
                  Admin Room
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] bg-danger text-white font-bold hover:bg-danger/90 transition-all shadow-lg shadow-danger/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
