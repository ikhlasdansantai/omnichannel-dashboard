import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { ExcelRow } from "@/const/interfaces/excel-row.interface";
interface Order {
  id: string;
  channel: string;
  status: string;
  buyer_user_id: string;
  pay_time: string;
  create_time: string;
  ship_by_date: string;
  synced_at: string;
  gross: number;
  net: number;
  discount: number;
  shipping_fee: number;
  buyer_count: number;
  items: number;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "frontendengineertask.xlsx");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Data file not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 400 });
    }

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });
    const formatDate = (val: string | Date | undefined): string => {
      if (!val) return "";
      if (val instanceof Date) return val.toISOString().replace("T", " ").slice(0, 19);
      return String(val);
    };

    const orders: Order[] = rows.map((r) => ({
      id:            String(r.order_id ?? ""),
      channel:       String(r.channel ?? ""),
      status:        String(r.order_status ?? ""),
      buyer_user_id: String(r.buyer_user_id ?? ""),
      pay_time:      formatDate(r.pay_time),
      create_time:   formatDate(r.create_time),
      ship_by_date:  formatDate(r.ship_by_date),
      synced_at:     formatDate(r.synced_at),
      gross:         Number(r.gross_amount ?? 0),
      net:           Number(r.net_amount ?? 0),
      discount:      Number(r.discount_amount ?? 0),
      shipping_fee:  Number(r.shipping_fee_amount ?? 0),
      buyer_count:   Number(r.buyer_count ?? 0),
      items:         Number(r.item_count ?? 0),
    }));

    return NextResponse.json({ orders }, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[/api/orders]", err);
    return NextResponse.json({ error: "Failed to parse data" }, { status: 500 });
  }
}
