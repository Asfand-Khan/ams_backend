import { z } from "zod";

const AssetRequestTypeEnum = z.enum(
  ["new", "replacement", "repair", "return", "issue", "complaint"],
  {
    required_error: "Asset Request Type is required",
  }
);

const ComplaintCategoryEnum = z.enum(
  ["hardware", "software", "network", "office_facility", "other"],
  {
    required_error: "Complaint Category is required",
  }
);

const AssetTypeEnum = z.enum(
  [
    "laptop",
    "desktop",
    "mouse",
    "keyboard",
    "monitor",
    "printer",
    "scanner",
    "hard_drive",
    "charger",
    "projector",
    "software_installation",
    "software_error",
    "internet_issue",
    "vpn_issue",
    "email_issue",
    "power_issue",
    "desk",
    "chair",
    "AC",
    "light",
    "other",
  ],
  {
    required_error: "Asset Type is required",
  }
);

export const assetComplaintRequestCreateSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  request_type: AssetRequestTypeEnum,

  category: ComplaintCategoryEnum,

  asset_type: AssetTypeEnum,

  reason: z
    .string({ required_error: "Reason is required" })
    .min(5, "Reason must be at least 5 characters long"),
});

export const assetComplaintRequestListingSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),
  status: z
    .enum(["pending", "in_progress", "rejected", "resolved"])
    .nullable()
    .optional(),
});

export const assetComplaintRequestSingleSchema = z.object({
  complaint_id: z
    .number({ required_error: "Complaint ID is required" })
    .int("Complaint ID must be an integer")
    .positive("Complaint ID must be a positive number"),
});

export type AssetComplaintRequestCreate = z.infer<
  typeof assetComplaintRequestCreateSchema
>;
export type AssetComplaintRequestListing = z.infer<
  typeof assetComplaintRequestListingSchema
>;
export type AssetComplaintRequestSingle = z.infer<
  typeof assetComplaintRequestSingleSchema
>;
