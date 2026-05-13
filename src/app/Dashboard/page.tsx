"use client";

import React from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BanknotesIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  StarIcon,
  BuildingStorefrontIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const orderTrend = [
  { day: "Mon", orders: 560 },
  { day: "Tue", orders: 790 },
  { day: "Wed", orders: 750 },
  { day: "Thu", orders: 800 },
  { day: "Fri", orders: 1220 },
  { day: "Sat", orders: 990 },
  { day: "Sun", orders: 640 },
];

const revenueSplit = [
  { name: "Vegetables", value: 85420, color: "#22c55e", percent: "48.7%" },
  { name: "Fruits", value: 45230, color: "#f97316", percent: "25.8%" },
  { name: "Leafy Greens", value: 25600, color: "#3b82f6", percent: "14.6%" },
  { name: "Others", value: 19070, color: "#8b5cf6", percent: "10.9%" },
];

const recentOrders = [
  { id: "#ORD12345", customer: "Ravi Kumar", time: "10:30 AM", amount: "Rs 450", status: "Delivered", tone: "green", label: "CG" },
  { id: "#ORD12344", customer: "Sneha Patel", time: "10:10 AM", amount: "Rs 320", status: "Out for Delivery", tone: "blue", label: "TM" },
  { id: "#ORD12343", customer: "Amit Singh", time: "09:45 AM", amount: "Rs 280", status: "Packed", tone: "orange", label: "BN" },
  { id: "#ORD12342", customer: "Priya Sharma", time: "09:20 AM", amount: "Rs 560", status: "Pending", tone: "yellow", label: "PT" },
  { id: "#ORD12341", customer: "Mehul Joshi", time: "08:50 AM", amount: "Rs 230", status: "Delivered", tone: "green", label: "ON" },
];

const topVegetables = [
  { rank: 1, name: "Tomato", category: "Vegetables", units: "342 kg", revenue: "Rs 25,560", swatch: "bg-red-500" },
  { rank: 2, name: "Potato", category: "Vegetables", units: "298 kg", revenue: "Rs 17,880", swatch: "bg-yellow-700" },
  { rank: 3, name: "Onion", category: "Vegetables", units: "276 kg", revenue: "Rs 15,180", swatch: "bg-fuchsia-700" },
  { rank: 4, name: "Green Chilli", category: "Vegetables", units: "187 kg", revenue: "Rs 9,350", swatch: "bg-lime-600" },
  { rank: 5, name: "Cucumber", category: "Vegetables", units: "165 kg", revenue: "Rs 7,920", swatch: "bg-green-600" },
];

const vendors = [
  { name: "Green Farm Fresh", orders: "128 Orders", rating: "4.8", revenue: "Rs 45,230" },
  { name: "Organic Valley", orders: "96 Orders", rating: "4.6", revenue: "Rs 32,410" },
  { name: "Desi Kisan", orders: "102 Orders", rating: "4.5", revenue: "Rs 28,750" },
  { name: "Fresh & Green", orders: "89 Orders", rating: "4.4", revenue: "Rs 22,890" },
  { name: "Pure Harvest", orders: "70 Orders", rating: "4.3", revenue: "Rs 18,640" },
];

const statusStyles: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function PanelHeader({ title, action = "View All" }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">{action}</button>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: "green" | "orange" | "blue";
}) {
  const accentClasses = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
            <span className="mb-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">{change}</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">vs yesterday</p>
        </div>
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border ${accentClasses[accent]}`}>
          <Icon className="h-8 w-8" strokeWidth={1.8} />
        </div>
      </div>
    </Panel>
  );
}

function SelectPill() {
  return (
    <button className="flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
      This Week
      <ChevronDownIcon className="h-4 w-4" />
    </button>
  );
}

function AvatarLabel({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-inner ${className}`}>
      {label}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 text-gray-950 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">Welcome back, Admin!</h1>
          <p className="mt-2 text-sm text-gray-500">Here&apos;s what&apos;s happening with Govigi today.</p>
        </div>
        <button className="flex h-11 w-fit items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          May 19, 2025
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders (Today)" value="1,248" change="+18.6%" icon={ShoppingBagIcon} accent="green" />
        <StatCard title="Revenue (Today)" value="Rs 1,75,320" change="+22.4%" icon={BanknotesIcon} accent="green" />
        <StatCard title="Active Vendors" value="142" change="+8.2%" icon={BuildingStorefrontIcon} accent="orange" />
        <StatCard title="Pending Deliveries" value="86" change="-12.1%" icon={TruckIcon} accent="blue" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_336px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
            <Panel className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-950">Orders Overview</h2>
                <SelectPill />
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrend} margin={{ left: -22, right: 8, top: 14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ stroke: "#22c55e", strokeDasharray: "4 4" }}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }}
                    />
                    <Area type="linear" dataKey="orders" stroke="#22c55e" strokeWidth={2} fill="url(#ordersGradient)" dot={{ r: 3.5, fill: "#22c55e", stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#22c55e", stroke: "#ffffff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-950">Revenue Overview</h2>
                <SelectPill />
              </div>
              <div className="grid min-h-72 grid-cols-1 items-center gap-4 sm:grid-cols-[190px_1fr]">
                <div className="relative h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueSplit} innerRadius={62} outerRadius={95} paddingAngle={0} dataKey="value">
                        {revenueSplit.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xl font-semibold">Rs 1,75,320</p>
                    <p className="mt-2 text-sm text-gray-500">Total</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {revenueSplit.map((item) => (
                    <div key={item.name} className="flex gap-3">
                      <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-sm font-medium text-gray-950">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">Rs {item.value.toLocaleString("en-IN")} ({item.percent})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.9fr)]">
            <Panel>
              <PanelHeader title="Top Selling Vegetables" />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="border-y border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">Vegetable</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Units Sold</th>
                      <th className="px-5 py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topVegetables.map((item) => (
                      <tr key={item.name} className="text-sm">
                        <td className="px-5 py-3 text-gray-700">{item.rank}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`h-8 w-8 rounded-full ${item.swatch}`} />
                            <span className="font-medium text-gray-950">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{item.category}</td>
                        <td className="px-5 py-3 text-gray-700">{item.units}</td>
                        <td className="px-5 py-3 font-medium text-gray-950">{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Vendor Performance" />
              <div className="mt-4 divide-y divide-gray-100">
                {vendors.map((vendor) => (
                  <div key={vendor.name} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-5 py-3">
                    <AvatarLabel label="GV" className="bg-emerald-100 !text-emerald-700 ring-1 ring-emerald-200" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-950">{vendor.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{vendor.orders}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
                      {vendor.rating}
                      <StarIcon className="h-4 w-4 fill-orange-400 stroke-orange-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-950">{vendor.revenue}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <aside className="space-y-5">
          <Panel className="p-4">
            <PanelHeader title="Recent Orders" />
            <div className="mt-4 space-y-3">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <AvatarLabel
                    label={order.label}
                    className={["bg-emerald-600", "bg-red-500", "bg-lime-600", "bg-yellow-700", "bg-fuchsia-700"][index]}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-gray-950">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.time}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-gray-700">{order.customer}</p>
                      <p className="text-sm font-medium text-gray-950">{order.amount}</p>
                    </div>
                  </div>
                  <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${statusStyles[order.tone]}`}>{order.status}</span>
                </div>
              ))}
            </div>
            <button className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              View All Orders
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </Panel>

          <Panel className="p-4">
            <h2 className="text-base font-semibold text-gray-950">Quick Actions</h2>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Add Product", icon: PlusCircleIcon, style: "bg-emerald-50 text-emerald-600" },
                { label: "Add Vendor", icon: BuildingStorefrontIcon, style: "bg-emerald-50 text-emerald-600" },
                { label: "Manage Banners", icon: MegaphoneIcon, style: "bg-orange-50 text-orange-600" },
                { label: "Send Notification", icon: BellIcon, style: "bg-violet-50 text-violet-600" },
                { label: "View Reports", icon: ClipboardDocumentListIcon, style: "bg-blue-50 text-blue-600" },
                { label: "App Settings", icon: Cog6ToothIcon, style: "bg-gray-50 text-gray-600" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-center text-[11px] font-medium text-gray-700 transition hover:border-emerald-200 hover:bg-emerald-50/50">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.style}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
