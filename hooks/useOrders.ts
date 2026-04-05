import { Order } from "@/const/interfaces/order.interface";
import { useEffect, useState } from "react";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Order[] }
  | { status: "error"; message: string };

const cache: { data: Order[] | null; ts: number } = { data: null, ts: 0 };
const TTL = 5 * 60 * 1000;

export function useOrders() {
  const [state, setState] = useState<State>({ status: "idle" });

  useEffect(() => {
    if (cache.data && Date.now() - cache.ts < TTL) {
      setState({ status: "success", data: cache.data });
      return;
    }

    setState({ status: "loading" });

    const controller = new AbortController();

    fetch("/api/orders", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{ orders: Order[] }>;
      })
      .then(({ orders }) => {
        cache.data = orders;
        cache.ts = Date.now();
        setState({ status: "success", data: orders });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error", message: err.message ?? "Unknown error" });
      });

    return () => controller.abort();
  }, []);

  const refetch = () => {
    cache.data = null;
    cache.ts = 0;
    setState({ status: "idle" });
  };

  return { ...state, refetch };
}
