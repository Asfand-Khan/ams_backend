import { z } from 'zod';

export const leaveTypeSchema = z.object({
  name: z.enum(['sick', 'casual', 'annual']),
  total_quota: z.number().min(0),
  is_active: z.boolean().optional().default(true),
  is_deleted: z.boolean().optional().default(false)
});

export type LeaveType = z.infer<typeof leaveTypeSchema>;