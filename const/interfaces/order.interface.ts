export interface Order {
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
