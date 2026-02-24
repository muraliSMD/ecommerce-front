
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSettingsStore } from "@/store/settingsStore";

export default function AnalyticsChart({ data }) {
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  return (
    <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-xl shadow-black/5 border border-gray-100 h-[400px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <h2 className="text-2xl font-display font-bold text-gray-900">Sales Overview</h2>
        <div className="flex gap-4">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="w-2 h-2 rounded-full bg-primary"></span> Revenue
            </span>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Orders
            </span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 20,
            }}
          >
            <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 12 }} 
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
            }}
            formatter={(value, name) => [
                name === 'sales' ? formatPrice(value) : value, 
                name === 'sales' ? 'Revenue' : 'Orders'
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="#4F46E5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorSales)" 
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
