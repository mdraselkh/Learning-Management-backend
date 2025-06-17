import { z } from "zod";

export const userSchemaRegister = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  phone: z
    .string()
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, {
      message: "Phone number must be a valid Bangladeshi number",
    })
    .optional(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  role: z.enum(["student", "admin", "instructor"]).optional().default("student"),

});


export const userSchemaLogin = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});
