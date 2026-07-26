import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Dumbbell,
  TrendingUp,
  User,
} from "lucide-react";

export default function AppLayout() {
  const navItems = [
    { to: "/dashboard", label: "Home", icon: LayoutDashboard },
    { to: "/plan", label: "Plan", icon: Calendar },
    { to: "/workout", label: "Workout", icon: Dumbbell },
    { to: "/progress", label: "Progress", icon: TrendingUp },
    { to: "/character", label: "Stats", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#1A1817] flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12 w-full">
        <Outlet />
      </main>

      {/* Fixed Bottom Nav (Mobile) / Floating Center Nav (Desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFCFA]/90 backdrop-blur-md border-t border-[#EAE3DE] px-4 py-2 sm:py-3 shadow-lg">
        <div className="max-w-md md:max-w-2xl mx-auto flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-medium transition-all ${
                    isActive
                      ? "text-[#6B2D3A] font-bold scale-105 bg-[#F2E8EA]"
                      : "text-[#8C7B75] hover:text-[#1A1817] hover:bg-[#F8F5F2]"
                  }`
                }
              >
                <Icon className="w-5 h-5 stroke-[1.75]" />
                <span className="text-[11px] font-serif">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
