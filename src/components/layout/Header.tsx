"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Package,
  Phone,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";
import { NAV_CATEGORIES } from "@/lib/constants/navigation";
import { CartIcon } from "../ui/CartIcon";
import { WishlistIcon } from "../ui/WishlistIcon";
import { SearchBar } from "../ui/SearchBar";
import { useApp } from "@/store";

export function Header() {
  const { state, logout } = useApp();
  const { isAuthenticated, user, isLoading } = state.auth;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownEnter = (id: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(id);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleMobileCategory = (id: string) => {
    setExpandedMobileCat(expandedMobileCat === id ? null : id);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-strong shadow-sm" : "bg-white"
      )}
    >
      {/* Top Bar - Hidden on Mobile */}
      <div className="hidden lg:block border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {CONTACT_INFO.workingHours}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {CONTACT_INFO.phone}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>GST Invoice Available</span>
            <span>|</span>
            <span>Bulk Orders Welcome</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-zinc-700 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo - 1099x306 native aspect ratio */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/boxzz-logo.png"
              alt="Boxzz Logo"
              width={1099}
              height={306}
              className="w-40 sm:w-44 md:w-48 h-auto object-contain"
              priority
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-6">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Search - Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-zinc-700 hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {isAuthenticated && user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {user.name.split(" ")[0]}
                </Link>
              ) : !isLoading ? (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:text-primary rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              ) : null}
            </div>

            {/* Desktop Icons */}
            <div className="hidden lg:flex items-center">
              <WishlistIcon />
              <CartIcon />
            </div>

            {/* Mobile Icons */}
            <div className="flex lg:hidden items-center">
              <WishlistIcon />
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden pb-3"
            >
              <SearchBar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-0.5 border-t border-zinc-100 py-1.5">
          <Link
            href="/"
            className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          {NAV_CATEGORIES.map((navCat) => (
            <div
              key={navCat.id}
              className="relative"
              onMouseEnter={() => handleDropdownEnter(navCat.id)}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                href={navCat.href || "#"}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap",
                  activeDropdown === navCat.id
                    ? "text-primary bg-orange-50"
                    : "text-zinc-600 hover:text-primary hover:bg-orange-50"
                )}
              >
                <span className="text-base">{navCat.icon}</span>
                <span>{navCat.name}</span>
                {navCat.children.length > 0 && (
                  <motion.span
                    animate={{ rotate: activeDropdown === navCat.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.span>
                )}
              </Link>

              {/* Dropdown */}
              <AnimatePresence>
                {activeDropdown === navCat.id && navCat.children.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    onMouseEnter={() => handleDropdownEnter(navCat.id)}
                    onMouseLeave={handleDropdownLeave}
                    className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-white border-b border-zinc-100">
                      <p className="text-sm font-semibold text-zinc-800">{navCat.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{navCat.description}</p>
                    </div>

                    {/* Items */}
                    <div className="py-1">
                      {navCat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 hover:text-primary hover:bg-orange-50 transition-colors group"
                        >
                          <span className="text-lg flex-shrink-0">{child.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{child.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{child.shortDescription}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                <div className="flex items-center">
                  <Image
                    src="/boxzz-logo.png"
                    alt="Boxzz Logo"
                    width={100}
                    height={32}
                    className="w-24 h-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {/* Auth Buttons */}
                <div className="px-4 py-3 border-b border-zinc-100">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-2 px-2 py-2 mb-2 bg-orange-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-800">{user.name}</p>
                          <p className="text-[10px] text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 py-2.5 text-sm font-medium text-zinc-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-primary" />
                        My Account
                      </Link>
                      <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-2 py-2.5 text-sm font-medium text-zinc-500 hover:text-error transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : !isLoading ? (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center gap-2 py-2.5 text-sm font-medium text-zinc-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <LogIn className="w-4 h-4 text-primary" />
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center gap-2 py-2.5 text-sm font-medium text-zinc-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserPlus className="w-4 h-4 text-primary" />
                        Sign Up
                      </Link>
                    </>
                  ) : null}
                </div>

                {/* Categories with Nested Accordion */}
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider py-2">
                    Categories
                  </p>
                  {NAV_CATEGORIES.map((navCat) => (
                    <div key={navCat.id}>
                      {navCat.children.length > 0 ? (
                        <>
                          <button
                            onClick={() => toggleMobileCategory(navCat.id)}
                            className="flex items-center justify-between w-full py-2.5 text-sm text-zinc-600 hover:text-primary transition-colors"
                          >
                            <span className="flex items-center gap-3">
                              <span className="text-base">{navCat.icon}</span>
                              <span className="font-medium">{navCat.name}</span>
                            </span>
                            <motion.span
                              animate={{ rotate: expandedMobileCat === navCat.id ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {expandedMobileCat === navCat.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-8 border-l-2 border-orange-100 pl-3 py-1 space-y-0.5">
                                  {navCat.children.map((child) => (
                                    <Link
                                      key={child.id}
                                      href={child.href}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                      className="flex items-center gap-2.5 py-2 text-sm text-zinc-500 hover:text-primary transition-colors rounded-lg px-2 hover:bg-orange-50"
                                    >
                                      <span>{child.icon}</span>
                                      <div>
                                        <p>{child.name}</p>
                                        <p className="text-[10px] text-zinc-400">{child.shortDescription}</p>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={navCat.href || "#"}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2.5 text-sm text-zinc-600 hover:text-primary transition-colors"
                        >
                          <span className="text-base">{navCat.icon}</span>
                          <span className="font-medium">{navCat.name}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="px-4 py-2 border-t border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider py-2">
                    Quick Links
                  </p>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 py-2.5 text-sm text-zinc-600 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 py-2.5 text-sm text-zinc-600 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Cart
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                <p className="text-xs text-zinc-500">{CONTACT_INFO.phone}</p>
                <p className="text-xs text-zinc-500">{CONTACT_INFO.email}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}