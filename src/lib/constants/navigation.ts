import type { CategorySlug } from "@/types";

export interface NavCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  href?: string;
  children: NavChildCategory[];
}

export interface NavChildCategory {
  id: CategorySlug;
  name: string;
  icon: string;
  shortDescription: string;
  href: string;
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "corrugated-boxes",
    name: "Corrugated Boxes",
    icon: "📦",
    description: "All corrugated boxes from 3 Ply to 7 Ply in standard sizes",
    children: [
      {
        id: "3-ply-boxes",
        name: "3 Ply Corrugated Boxes",
        icon: "📦",
        shortDescription: "37 sizes • Starting ₹2.50",
        href: "/category/3-ply-boxes",
      },
      {
        id: "3-ply-flap-boxes",
        name: "3 Ply Flap Boxes",
        icon: "📋",
        shortDescription: "13 sizes • Starting ₹1.75",
        href: "/category/3-ply-flap-boxes",
      },
      {
        id: "3-ply-printed-flap-boxes",
        name: "Printed Flap Boxes",
        icon: "🎨",
        shortDescription: "2 sizes • Starting ₹7.50",
        href: "/category/3-ply-printed-flap-boxes",
      },
      {
        id: "3-ply-white-boxes",
        name: "3 Ply White Boxes",
        icon: "⬜",
        shortDescription: "6 sizes • Starting ₹3.50",
        href: "/category/3-ply-white-boxes",
      },
      {
        id: "3-ply-flap-white-boxes",
        name: "3 Ply Flap White Boxes",
        icon: "🤍",
        shortDescription: "12 sizes • Starting ₹2.15",
        href: "/category/3-ply-flap-white-boxes",
      },
      {
        id: "5-ply-boxes",
        name: "5 Ply Corrugated Boxes",
        icon: "💪",
        shortDescription: "5 sizes • Starting ₹26.00",
        href: "/category/5-ply-boxes",
      },
      {
        id: "7-ply-boxes",
        name: "7 Ply Corrugated Boxes",
        icon: "🔷",
        shortDescription: "Starting ₹110.00",
        href: "/category/7-ply-boxes",
      },
    ],
  },
  {
    id: "packaging-tapes",
    name: "Packaging Tapes",
    icon: "🔵",
    description: "BOPP tapes for e-commerce, warehousing & shipping",
    href: "/category/packaging-tapes",
    children: [
      {
        id: "packaging-tapes",
        name: "All Packaging Tapes",
        icon: "🔵",
        shortDescription: "5 types available",
        href: "/category/packaging-tapes",
      },
    ],
  },
  {
    id: "protective-packaging",
    name: "Protective Packaging",
    icon: "🛡️",
    description: "Bubble wrap, poly bags, corrugated rolls for safe shipping",
    href: "/categories",
    children: [
      {
        id: "paper-bubble-wrap",
        name: "Paper Bubble Wrap",
        icon: "📜",
        shortDescription: "2 sizes • Starting ₹650/roll",
        href: "/category/paper-bubble-wrap",
      },
      {
        id: "poly-bags",
        name: "Poly Bags (With POD)",
        icon: "🛍️",
        shortDescription: "7 sizes • ₹160/kg",
        href: "/category/poly-bags",
      },
      {
        id: "corrugated-roll",
        name: "Corrugated Roll",
        icon: "🔄",
        shortDescription: "4 sizes • ₹50/kg",
        href: "/category/corrugated-roll",
      },
    ],
  },
  {
    id: "labels-media",
    name: "Labels & Media",
    icon: "🏷️",
    description: "Thermal labels, sticker paper & printing media",
    href: "/category/thermal-labels",
    children: [
      {
        id: "thermal-labels",
        name: "Thermal Label Paper",
        icon: "🏷️",
        shortDescription: "4 variants • Starting ₹65",
        href: "/category/thermal-labels",
      },
    ],
  },
  {
    id: "custom-order",
    name: "Custom Order",
    icon: "✨",
    description: "Custom-sized boxes & branded packaging",
    href: "/custom-packaging",
    children: [],
  },
];