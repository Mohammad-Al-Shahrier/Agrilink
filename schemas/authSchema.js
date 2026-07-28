import { z } from "zod";

export const registerSchema = z.object({

  name: z
    .string()
    .min(3, "Name must be at least 3 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z
    .enum(["customer", "farmer"])
    .optional(),

  /* Optional role-specific fields.
     NOTE: zod's z.object() strips any key not declared here by
     default, so without these three lines farmName/location/address
     were silently deleted from req.body before registerUser ever
     saw them — every farmer signup was saved with blank farm info. */
  farmName: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional()

});

export const loginSchema = z.object({

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")

});