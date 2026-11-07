import type { Order } from "@/types/commerce";
export type AdminOrderRow = Pick<
  Order,
  | "reference"
  | "customerName"
  | "customerPhone"
  | "status"
  | "paymentMethod"
  | "paymentStatus"
  | "total"
  | "createdAt"
>;
export interface AdminOverview {
  orders: number;
  pendingApproval: number;
  paymentVerification: number;
  paymentsRecorded: number;
  readyToPack: number;
  lowStock: number;
  weekOrders: number;
  activity: { date: string; label: string; orders: number }[];
  paymentMethods: { COD: number; UPI: number };
  recentOrders: (AdminOrderRow & { itemCount: number })[];
  dashboard: {
    days: 7 | 30 | 180 | 365;
    startDate: string;
    endDate: string;
    revenue: number;
    revenueChange: number | null;
    orderCount: number;
    orderChange: number | null;
    products: number;
    publishedProducts: number;
    acceptanceRate: number | null;
    acceptanceChange: number | null;
    revenueActivity: {
      date: string;
      label: string;
      revenue: number;
      orders: number;
    }[];
    topProducts: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      sold: number;
      revenue: number;
    }[];
  };
  configuration: {
    minimumOrderEnabled: boolean;
    minimumOrderAmount: number;
    codEnabled: boolean;
    upiEnabled: boolean;
    whatsappConfigured: boolean;
  };
}
export interface AdminOrderList {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}
