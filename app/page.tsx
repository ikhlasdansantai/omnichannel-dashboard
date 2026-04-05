"use client";

import Link from "next/link";
import { LayoutDashboard, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import {
  MetricCardSkeleton,
  ChartSkeleton,
  ChannelSkeleton,
  TableSkeleton,
  ErrorState,
} from "@/components/common/Skeleton";
import dynamic from "next/dynamic";
import { Order } from "@/const/interfaces/order.interface";
import { DashboardMetrics } from "@/const/interfaces/dashboard-metrics.interface";
import { KeyMetricCardProps } from "@/const/interfaces/metric-card-props.interface";

const RevenueChart = dynamic(() => import("@/components/common/RevenueChart"), {
  ssr: false,
});
const RevenueByChannel = dynamic(
  () => import("@/components/common/RevenueByChannel"),
  { ssr: false },
);
const OrdersTable = dynamic(() => import("@/components/common/CTable"), {
  ssr: false,
});






const fmt = (n: number): string =>
  n >= 1_000_000
    ? `Rp ${(n / 1_000_000).toFixed(1)}M`
    : `Rp ${(n / 1_000).toFixed(0)}K`;

function computeMetrics(orders: Order[]): DashboardMetrics {
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const cancelled = orders.filter((o) => o.status === "CANCELLED");
  const totalNet = completed.reduce((s, o) => s + o.net, 0);
  const aov = completed.length ? totalNet / completed.length : 0;
  const cancelRate = orders.length
    ? (cancelled.length / orders.length) * 100
    : 0;

  return { totalNet, completedCount: completed.length, aov, cancelRate };
}


function Sidebar() {
  return (
    <aside className="border-r border-border h-screen py-10 px-3 bg-sidebar sticky top-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest px-2 mb-4">
        Menu
      </p>
      <ul className="space-y-1">
        <li>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <LayoutDashboard size={17} />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/analytics"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <BarChart2 size={17} />
            Analytics
          </Link>
        </li>
      </ul>
    </aside>
  );
}

function KeyMetricCard({ title, label, statistic }: KeyMetricCardProps) {
  const isNeg = statistic.startsWith("-");
  return (
    <div className="flex flex-col gap-6 justify-between border bg-card dark:border-primary p-4 py-6 rounded-lg dark:bg-linear-to-b from-card to-primary/10">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div>
        <b className="block text-3xl font-semibold tracking-tight">{label}</b>
        <div className="flex items-center gap-2 mt-2.5">
          <Badge
            variant={isNeg ? "destructive" : "secondary"}
            className="text-xs py-1"
          >
            {statistic}%
          </Badge>
          <p className="text-xs text-muted-foreground">vs prev period</p>
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const result = useOrders();
  const orders: Order[] = result.status === "success" ? result.data : [];
  const message: string = result.status === "error" ? result.message : "";
  const { status, refetch } = result;

  const metrics: DashboardMetrics | null =
    status === "success" ? computeMetrics(orders) : null;
  return (
    <main className="grid grid-cols-[220px_1fr] bg-background min-h-screen text-base">
      <Sidebar />

      <section className="py-6 px-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-lg font-semibold">Overview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            March 2026 · All channels
          </p>
        </div>

        {status === "error" && (
          <ErrorState
            message={message ?? "Terjadi kesalahan saat memuat data"}
            onRetry={refetch}
          />
        )}

        {status !== "error" && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Key metrics
            </p>
            <div className="grid grid-cols-4 gap-3">
              {status === "loading" || status === "idle" || !metrics ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))
              ) : (
                <>
                  <KeyMetricCard
                    title="Net revenue"
                    label={fmt(metrics.totalNet)}
                    statistic="+20"
                  />
                  <KeyMetricCard
                    title="Orders completed"
                    label={metrics.completedCount.toLocaleString()}
                    statistic="-1"
                  />
                  <KeyMetricCard
                    title="Avg order value"
                    label={fmt(metrics.aov)}
                    statistic="-2.3"
                  />
                  <KeyMetricCard
                    title="Cancellation rate"
                    label={`${metrics.cancelRate.toFixed(1)}%`}
                    statistic="+3"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {status !== "error" && (
          <div className="grid grid-cols-[1fr_300px] gap-4">
            {status === "loading" || status === "idle" ? (
              <>
                <ChartSkeleton />
                <ChannelSkeleton />
              </>
            ) : (
              <>
                <RevenueChart orders={orders} />
                <RevenueByChannel orders={orders} />
              </>
            )}
          </div>
        )}

        {status !== "error" && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              Transactions
            </p>
            {status === "loading" || status === "idle" ? (
              <TableSkeleton />
            ) : (
              <OrdersTable orders={orders} />
            )}
          </div>
        )}
      </section>
    </main>
  );
}
