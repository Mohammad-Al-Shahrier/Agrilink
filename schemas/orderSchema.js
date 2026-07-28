import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "delivered", "cancelled"], {
    errorMap: () => ({ message: "Status must be one of: pending, confirmed, delivered, cancelled" })
  })
});
