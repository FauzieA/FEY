export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-[#6B2D3A] bg-[#6B2D3A] text-[#F8F5F2]"
                : "border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE] hover:text-[#6B2D3A]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
