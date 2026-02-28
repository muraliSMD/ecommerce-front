"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useSettingsStore } from "@/store/settingsStore";

const COLORS = ["#4F46E5", "#60A5FA", "#34D399", "#FBBF24", "#F87171", "#818CF8"];

export default function CategorySalesChart({ data }) {
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 h-[400px] flex items-center justify-center">
        <p className="text-gray-400">No category data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 h-[400px] flex flex-col">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 shrink-0">Sales by Category</h2>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              formatter={(value) => formatPrice(value)}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
