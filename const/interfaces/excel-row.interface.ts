export interface ExcelRow {
  order_id?: string | number;
  channel?: string;
  order_status?: string;
  buyer_user_id?: string | number;
  pay_time?: string | Date;
  create_time?: string | Date;
  ship_by_date?: string | Date;
  synced_at?: string | Date;
  gross_amount?: number;
  net_amount?: number;
  discount_amount?: number;
  shipping_fee_amount?: number;
  buyer_count?: number;
  item_count?: number;
}
