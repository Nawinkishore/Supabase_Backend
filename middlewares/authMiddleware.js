// middleware/authenticate.js
import { supabase } from '../config/supabase.js';
import asyncHandler from '../utils/errorHandler.js';

const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided',
    });
  }

  // Verify token with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, token failed',
    });
  }

  req.user = data.user;
  req.token = token;
  next();
});

export { authenticate };
