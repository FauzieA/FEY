import {
  BookOpen,
  Dumbbell,
  FlaskConical,
  Heart,
  LayoutDashboard,
  Moon,
  NotebookPen,
  User,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ModuleId } from "@/types/modules";

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  path: string;
  icon: LucideIcon;
  tagline: string;
  /** Shown in the mobile bottom bar. */
  primary?: boolean;
}

export const MODULES: ModuleDefinition[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, tagline: "Today at a glance", primary: true },
  { id: "faith", label: "Islam", path: "/faith", icon: Moon, tagline: "Prayer, Qur'an, adhkar, fasts", primary: true },
  { id: "training", label: "Training", path: "/training", icon: Dumbbell, tagline: "Workouts, progression, analytics", primary: true },
  { id: "health", label: "Health", path: "/health", icon: Heart, tagline: "Body, sleep, cycle, measurements", primary: true },
  { id: "library", label: "Library", path: "/library", icon: BookOpen, tagline: "Reading, finished books, waiting room", primary: true },
  { id: "perfumery", label: "Perfumery", path: "/perfumery", icon: FlaskConical, tagline: "Formulas, versions, development" },
  { id: "wealth", label: "Wealth", path: "/wealth", icon: Wallet, tagline: "Savings, goals, purchase planning" },
  { id: "life", label: "Life", path: "/life", icon: NotebookPen, tagline: "Journal, people, timeline" },
  { id: "character", label: "Character", path: "/character", icon: User, tagline: "Who I am becoming" },
];

export const PRIMARY_MODULES = MODULES.filter((module) => module.primary);
