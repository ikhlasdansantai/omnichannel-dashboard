"use client"
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Order } from "@/const/interfaces/order.interface";

interface OrdersTableProps {
  orders: Order[];
}

// Menentukan tipe parameter angka untuk formatter
const fmt = (n: number): string => `Rp ${n.toLocaleString("id-ID")}`;

const PAGE_SIZE = 8;

// Mendefinisikan struktur kolom agar type-safe dengan interface Order
interface ColumnConfig {
  key: keyof Order;
  label: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: "id", label: "Order ID" },
  { key: "channel", label: "Channel" },
  { key: "pay_time", label: "Pay time" },
  { key: "gross", label: "Gross" },
  { key: "discount", label: "Discount" },
  { key: "net", label: "Net" },
  { key: "items", label: "Items" },
  { key: "status", label: "Status" },
];

interface SortIconProps {
  col: keyof Order;
  sortKey: keyof Order;
  sortDir: "asc" | "desc";
}

function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== col)
    return (
      <ChevronsUpDown size={13} className="text-muted-foreground opacity-50" />
    );
  return sortDir === "asc" ? (
    <ChevronUp size={13} />
  ) : (
    <ChevronDown size={13} />
  );
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Order>("pay_time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const channels = useMemo(() => ["all", ...Array.from(new Set(orders.map((d) => d.channel)))], [orders]);
  const statuses = useMemo(() => ["all", ...Array.from(new Set(orders.map((d) => d.status)))], [orders]);

  const filtered = useMemo(() => {
    const d = orders.filter((r) => {
      const q = search.toLowerCase();
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.channel.toLowerCase().includes(q);
      const matchC = channel === "all" || r.channel === channel;
      const matchS = status === "all" || r.status === status;
      return matchQ && matchC && matchS;
    });

    return [...d].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];

      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      // Memastikan TypeScript tahu ini adalah perbandingan angka
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [orders, search, channel, status, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Parameter key sekarang memiliki tipe yang ketat berdasarkan interface Order
  const handleSort = (key: keyof Order) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground overflow-hidden">
      {/* toolbar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b flex-wrap">
        <div className="relative flex-1 min-w-45">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order ID..."
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select
          value={channel}
          onValueChange={(v) => {
            setChannel(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32.5 h-8 text-sm">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All channels" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32.5 h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all"
                  ? "All status"
                  : s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} orders
        </span>
      </div>

      {/* table */}
      <Table>
        <TableCaption className="mb-3 text-xs">
          Showing {paginated.length} of {filtered.length} orders · March 2026
        </TableCaption>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-10"
              >
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {row.pay_time}
                </TableCell>
                <TableCell>{fmt(row.gross)}</TableCell>
                <TableCell
                  className={
                    row.discount > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {row.discount > 0 ? `-${fmt(row.discount)}` : "—"}
                </TableCell>
                <TableCell className="font-medium">{fmt(row.net)}</TableCell>
                <TableCell className="text-center">{row.items}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "COMPLETED" ? "secondary" : "destructive"
                    }
                  >
                    {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t">
        <span className="text-xs text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="w-8 h-8 p-0 text-xs"
          >
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="w-8 h-8 p-0 text-xs"
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="w-8 h-8 p-0 text-xs"
          >
            ›
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="w-8 h-8 p-0 text-xs"
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}
