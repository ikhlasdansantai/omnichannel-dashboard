"use client";

import { useState, useMemo, useEffect, useLayoutEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Order } from "@/const/interfaces/order.interface";

type Granularity = "Daily" | "Weekly" | "Yearly";
type Metric      = "Revenue" | "Orders";

interface ChartDataPoint {
  key:    string;
  label:  string;
  net:    number;
  orders: number;
}

interface ChartColors {
  bar:             string;
  grid:            string;
  muted:           string;
  mutedForeground: string;
}

const MONTHS: string[] = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const GRANULARITIES: Granularity[] = ["Daily", "Weekly", "Yearly"];
const METRICS: Metric[]            = ["Revenue", "Orders"];

const FALLBACK_COLORS: ChartColors = {
  bar:             "#7c6a52",
  grid:            "#e0ddd8",
  muted:           "#f5f3f0",
  mutedForeground: "#9a9890",
};

function resolveCssColor(varName: string): string {
  if (typeof window === "undefined") return "";
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (!raw) return "";
  if (raw.startsWith("#") || raw.includes("(")) return raw;
  return `oklch(${raw})`;
}

function buildColors(): ChartColors {
  return {
    bar:             resolveCssColor("--chart-1")          || FALLBACK_COLORS.bar,
    grid:            resolveCssColor("--border")           || FALLBACK_COLORS.grid,
    muted:           resolveCssColor("--muted")            || FALLBACK_COLORS.muted,
    mutedForeground: resolveCssColor("--muted-foreground") || FALLBACK_COLORS.mutedForeground,
  };
}

export default function RevenueChart({ orders }: { orders: Order[] }) {
  const [metric,      setMetric]      = useState<Metric>("Revenue");
  const [granularity, setGranularity] = useState<Granularity>("Daily");
  const [colors,      setColors]      = useState<ChartColors>(FALLBACK_COLORS);

  useLayoutEffect(() => {
    setColors(buildColors());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(buildColors()));
    observer.observe(document.documentElement, {
      attributes: true, attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const completed = orders.filter(
      (d): d is Order & { pay_time: string } =>
        d.status === "COMPLETED" && Boolean(d.pay_time),
    );

    const buckets = new Map<string, ChartDataPoint>();

    completed.forEach((d) => {
      const dt = new Date(d.pay_time);
      if (isNaN(dt.getTime())) return;

      let key: string;
      let label: string;

      if (granularity === "Daily") {
        key   = d.pay_time.split(" ")[0];
        label = `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
      } else if (granularity === "Weekly") {
        const day    = dt.getDay();
        const diff   = dt.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(dt);
        monday.setDate(diff);
        key   = monday.toISOString().split("T")[0];
        label = `W${monday.getDate()} ${MONTHS[monday.getMonth()]}`;
      } else {
        key   = String(dt.getFullYear());
        label = String(dt.getFullYear());
      }

      const existing = buckets.get(key);
      if (existing) {
        existing.net    += d.net;
        existing.orders += 1;
      } else {
        buckets.set(key, { key, label, net: d.net, orders: 1 });
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((b) => ({ ...b, net: Math.round(b.net / 1000) }));
  }, [orders, granularity]);

  const dataKey = metric === "Revenue" ? "net" : "orders" as const;

  const totalValue = useMemo(
    () => chartData.reduce((acc, d) => acc + d[dataKey], 0),
    [chartData, dataKey],
  );

  const avgValue = chartData.length > 0 ? totalValue / chartData.length : 0;

  const avgUnit =
    granularity === "Daily" ? "day" :
    granularity === "Weekly" ? "week" : "year";

  const yWidth = metric === "Revenue" ? 56 : 36;

  const formatY = (v: number): string =>
    metric === "Revenue"
      ? `${v.toLocaleString("id-ID")}K`
      : String(v);

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-5">

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium tracking-tight">Revenue trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Completed orders · {granularity.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
            <SelectTrigger className="h-7 w-25 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
            <SelectTrigger className="h-7 w-25 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITIES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold">
          {metric === "Revenue"
            ? `Rp ${totalValue.toLocaleString("id-ID")}K`
            : totalValue.toLocaleString("id-ID")}
        </span>
        <span className="text-xs text-muted-foreground">
          avg/{avgUnit}:{" "}
          <span className="font-medium text-foreground">
            {metric === "Revenue"
              ? `Rp ${Math.round(avgValue).toLocaleString("id-ID")}K`
              : Math.round(avgValue)}
          </span>
        </span>
      </div>

      <div className="h-px bg-border my-4" />

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          barSize={Math.max(8, Math.min(28, 360 / (chartData.length || 1)))}
          margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke={colors.grid}
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: colors.mutedForeground }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            width={yWidth}
            tick={{ fontSize: 11, fill: colors.mutedForeground }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatY}
          />
          <Tooltip
            cursor={{ fill: colors.muted, opacity: 0.6, radius: 4 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const val = Number(payload[0]?.value ?? 0);
              return (
                <div className="rounded-lg border bg-popover text-popover-foreground shadow-md px-3 py-2 text-sm">
                  <p className="text-muted-foreground mb-1">{label}</p>
                  <p className="font-semibold">
                    {metric === "Revenue"
                      ? `Rp ${val.toLocaleString("id-ID")}K`
                      : `${val} orders`}
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey={dataKey}
            fill={colors.bar}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}
