export type InventoryStatus = "available" | "reserved" | "sold" | "archived";
export type PublishStatus = "draft" | "published" | "archived";
export type PaymentStatus = "pending_verification" | "verified" | "rejected";
export type OrderStatus = "pending" | "approved" | "rejected" | "cancelled";
export type CustomRequestStatus =
  | "new"
  | "in_review"
  | "quoted"
  | "accepted"
  | "declined"
  | "completed";
export type ArtistApprovalStatus = "pending" | "approved" | "rejected";

export type Artist = {
  id: string;
  display_name: string;
  bio: string | null;
  photo_path: string | null;
  approval_status: ArtistApprovalStatus;
  payout_profile: Record<string, unknown> | null;
  public_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Artwork = {
  id: string;
  artist_id: string;
  title: string;
  medium: string;
  dimensions: string;
  story: string;
  price: number;
  currency: string;
  inventory_status: InventoryStatus;
  publish_status: PublishStatus;
  preview_path: string | null;
  /** Private storage path — never send to public clients */
  original_path?: string | null;
  preview_tone: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  artists?: Pick<Artist, "display_name"> | null;
};

/** Safe public shape — excludes original_path */
export type PublicArtwork = {
  id: string;
  title: string;
  artist: string;
  medium: string;
  size: string;
  price: number;
  currency: string;
  status: "Available" | "Reserved";
  inventoryStatus: InventoryStatus;
  tone: string;
  story: string;
  previewUrl: string | null;
};

export type Order = {
  id: string;
  reference_number: string;
  artwork_id: string;
  artwork_title: string;
  amount: number;
  currency: string;
  buyer_phone: string;
  buyer_email: string | null;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomRequest = {
  id: string;
  reference_number: string;
  requested_artwork: string;
  theme_message: string;
  preferred_size: string | null;
  style: string | null;
  budget: number | null;
  deadline: string | null;
  name: string;
  phone: string;
  email: string | null;
  status: CustomRequestStatus;
  assigned_artist_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export function inventoryLabel(status: InventoryStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "reserved":
      return "Reserved";
    case "sold":
      return "Sold";
    case "archived":
      return "Archived";
  }
}
