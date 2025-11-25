import { User } from '@/database/entities';

function sanitizeUser(user: User) {
  const { password, ...rest } = user;
  return rest;
}

export const JwtUtil = {
  sanitizeUser,
};
