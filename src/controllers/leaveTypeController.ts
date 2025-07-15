import { Request, Response } from 'express';
import * as service from '../services/leaveTypeServices';
import { leaveTypeSchema } from '../validations/leaveTypeValidations';

export const getAll = async (req: Request, res: Response) => {
  const types = await service.getLeaveTypes();
  res.json({ success: true, data: types });
};

export const create = async (req: Request, res: Response) => {
  const parsed = leaveTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const type = await service.createLeaveType(parsed.data);
  res.status(201).json({ success: true, data: type });
};

export const update = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const parsed = leaveTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const type = await service.updateLeaveType(id, parsed.data);
  res.json({ success: true, data: type });
};

export const remove = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await service.deleteLeaveType(id);
  res.json({ success: true, message: 'Leave type deleted (soft)' });
};