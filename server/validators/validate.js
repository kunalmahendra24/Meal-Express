// Rejects malformed payloads before they reach a controller, in a single consistent shape.
// Controllers keep their own checks; this is only a guard in front of them.
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    next();
};

export default validate;
