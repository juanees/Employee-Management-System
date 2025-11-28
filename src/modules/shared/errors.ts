import { Prisma } from '@prisma/client';

const isKnownRequestError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError;

export const isRecordNotFoundError = (error: unknown) =>
  isKnownRequestError(error) && error.code === 'P2025';

export const isForeignKeyConstraintError = (error: unknown) =>
  isKnownRequestError(error) && error.code === 'P2003';

export class DeleteConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeleteConflictError';
  }
}
