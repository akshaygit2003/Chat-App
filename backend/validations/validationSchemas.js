import { z } from "zod";

export const signupSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username cannot exceed 30 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
      gender: z.enum(["male", "female", "other"]).optional().default("other"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(10, "Google credential token is required"),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid receiver ID format"),
  }),
  body: z.object({
    message: z.string().trim().max(2000, "Message cannot exceed 2000 characters").optional().default(""),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  }),
  query: z
    .object({
      cursor: z.string().optional(),
      limit: z.coerce.number().min(1).max(100).optional().default(30),
      paginated: z.string().optional(),
    })
    .optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(50).optional(),
    bio: z.string().trim().max(150, "Bio cannot exceed 150 characters").optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
  }),
});
