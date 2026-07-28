import { NavLink } from "react-router-dom";
import { PRIMARY_MODULES } from "@/config/modules";

/** Compact bottom bar for the most-used modules; the rest live in the drawer. */
export function MobileNav() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#F8F5F2] via-[#F8F5F2]/90 to-transparent px-4 pb-3 pt-2 md:hidden">
      <nav className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-full border border-[#EAE3DE] bg-[#FFFCFA] px-3 py-2 shadow-lg shadow-[#6B2D3A]/5">
        {PRIMARY_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <NavLink
              key={module.id}
              to={module.path}
              className="group relative flex flex-1 flex-col items-center justify-center py-1"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center rounded-full px-3 py-1 transition-all ${
                      isActive ? "scale-105 bg-[#F2E8EA] text-[#6B2D3A]" : "text-[#8C7B75]"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.5]"}`} />
                  </span>
                  <span
                    className={`mt-0.5 text-[9px] font-medium tracking-tight ${
                      isActive ? "font-semibold text-[#6B2D3A]" : "text-[#8C7B75]"
                    }`}
                  >
                    {module.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default MobileNav;
