"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import type {
  AgeDemographicBucket,
  CityDistributionReport,
  HusbandFamilyReport,
} from "@/types/family";

const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

type ReportsDashboardProps = {
  city: CityDistributionReport | null;
  ages: AgeDemographicBucket[];
  household: HusbandFamilyReport | null;
};

export function ReportsDashboard({
  city,
  ages,
  household,
}: ReportsDashboardProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid="reports-dashboard">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Age demographics
        </h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ages}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {household && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Household metrics
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/40">
              <dt className="text-zinc-500">Wives</dt>
              <dd className="text-2xl font-semibold">{household.wifeCount}</dd>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <dt className="text-zinc-500">Total children</dt>
              <dd className="text-2xl font-semibold">
                {household.totalChildren}
              </dd>
            </div>
          </dl>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={household.byWife.map((w) => ({
                  name: w.wifeName.split(" ")[0],
                  children: w.childrenCount,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="children" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {city && (
        <>
          <CityPie title="Current city" data={city.currentCity} />
          <CityPie title="Home town" data={city.homeTown} />
          <CityPie title="Birth place" data={city.birthPlace} />
        </>
      )}
    </div>
  );
}

function CityPie({
  title,
  data,
}: {
  title: string;
  data: { label: string; count: number }[];
}) {
  const top = data.slice(0, 6);
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(props) =>
                `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {top.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
