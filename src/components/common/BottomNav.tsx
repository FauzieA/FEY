import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  History,
  LineChart,
  User,
} from "lucide-react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Workout", path: "/workout", icon: Dumbbell },
    { label: "History", path: "/history", icon: History },
    { label: "Progress", path: "/progress", icon: LineChart },
    { label: "Character", path: "/character", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pt-2 bg-gradient-to-t from-[#F8F5F2] via-[#F8F5F2]/90 to-transparent pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto bg-[#FFFCFA] border border-[#EAE3DE] rounded-full shadow-lg shadow-[#6B2D3A]/5 px-3 py-2 flex items-center justify-between backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname.startsWith(item.path) ||
            (location.pathname === "/" && item.path === "/dashboard");

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 group transition-all duration-200"
            >
              {/* Active Background Pill */}
              <div
                className={`flex items-center justify-center rounded-full px-3 py-1 transition-all duration-300 ${
                  isActive
                    ? "bg-[#F2E8EA] text-[#6B2D3A] scale-105"
                    : "text-[#8C7B75] group-hover:text-[#1A1817]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "stroke-[2.2] scale-110" : "stroke-[1.5]"
                  }`}
                />
              </div>

              {/* Tab Label */}
              <span
                className={`text-[9px] font-medium tracking-tight mt-0.5 transition-colors duration-200 ${
                  isActive ? "text-[#6B2D3A] font-semibold" : "text-[#8C7B75]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
