import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN || '30d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserFromRequest = async (req) => {
  const authHeader = req.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else {
    // Check cookies if you use them
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value;
  }

  if (!token) return null;

  return verifyToken(token);
};

import User from '@/models/User';
import dbConnect from './db';

export const getFullUserFromRequest = async (req) => {
  const payload = await getUserFromRequest(req);
  if (!payload) return null;
  
  await dbConnect();
  try {
    return await User.findById(payload.userId).select('-password');
  } catch (error) {
    return null;
  }
};

export const isAdmin = (user) => {
  return user && user.role === 'admin';
};
