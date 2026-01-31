/**
 * Middleware for validating API responses against schemas
 */

/**
 * Creates a middleware that validates response data against a schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateResponse(schema) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Only validate in non-production or when explicitly enabled
      if (process.env.NODE_ENV !== 'production' || process.env.VALIDATE_SCHEMAS === 'true') {
        const result = schema.safeParse(data);
        if (!result.success) {
          console.error('Schema validation error:', result.error);
          console.error('Response data:', JSON.stringify(data, null, 2));
          
          // In development, return validation error
          if (process.env.NODE_ENV !== 'production') {
            return originalJson({
              error: 'Internal server error: response schema validation failed',
              details: process.env.NODE_ENV === 'test' ? result.error.errors : undefined,
            });
          }
        }
      }
      
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Validates request body against a schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: result.error.errors,
      });
    }
    
    req.body = result.data;
    next();
  };
}
