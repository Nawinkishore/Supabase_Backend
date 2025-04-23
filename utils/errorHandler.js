import dotenv from 'dotenv';
dotenv.config();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error(error);
      
      const statusCode = error.message.includes('Invalid') ? 401 : 
                        error.message.includes('Unauthorized') ? 403 : 
                        error.message.includes('exist') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  };
  
  export default asyncHandler;