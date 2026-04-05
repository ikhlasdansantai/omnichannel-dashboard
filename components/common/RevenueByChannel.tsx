import { Order } from "@/const/interfaces/order.interface";

interface RevenueByChannelProps {
  orders: Order[];
}

const CHANNEL_COLORS: Record<string, string> = {
  Shopee: "bg-primary",
  TikTok: "bg-secondary",
};

const fmt = (n: number) =>
  n >= 1_000_000
    ? `Rp ${(n / 1_000_000).toFixed(1)}M`
    : `Rp ${(n / 1_000).toFixed(0)}K`;

export default function RevenueByChannel({ orders }: RevenueByChannelProps) {
  const totals = orders.reduce<Record<string, number>>((acc, d) => {
    acc[d.channel] = (acc[d.channel] ?? 0) + d.net;
    return acc;
  }, {});

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  const channels = Object.entries(totals)
    .map(([channel, net]) => ({
      channel,
      net,
      share: Math.round((net / grandTotal) * 100),
    }))
    .sort((a, b) => b.net - a.net);

  return (
    <div className="rounded-lg border bg-card text-card-foreground p-5 space-y-5">
      <div>
        <p className="text-sm font-medium">Revenue by channel</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share of total net revenue
        </p>
      </div>

      {/* stacked bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full gap-0.5">
        {channels.map(({ channel, share }) => (
          <div
            key={channel}
            className={CHANNEL_COLORS[channel] ?? "bg-muted"}
            style={{ width: `${share}%` }}
          />
        ))}
      </div>

      {/* channel rows */}
      <div className="space-y-3">
        {channels.map(({ channel, net, share }) => (
          <div key={channel} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${CHANNEL_COLORS[channel] ?? "bg-muted"}`}
                />
                <span className="font-medium">{channel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs">{fmt(net)}</span>
                <span className="font-medium w-9 text-right">{share}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${CHANNEL_COLORS[channel] ?? "bg-muted-foreground"}`}
                style={{ width: `${share}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* total */}
      <div className="pt-3 border-t flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold">{fmt(grandTotal)}</span>
      </div>
    </div>
  );
}
