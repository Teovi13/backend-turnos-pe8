const SOURCES = ['params', 'query', 'body'];

export const validate = (schemas) => (req, res, next) => {
  const details = [];
  const validated = {};

  for (const source of SOURCES) {
    if (!schemas[source]) continue;

    const result = schemas[source].safeParse(req[source] ?? {});

    if (result.success) {
      validated[source] = result.data;
    } else {
      result.error.issues.forEach((issue) => {
        details.push({ field: issue.path.join('.') || source, message: issue.message });
      });
    }
  }

  if (details.length > 0) {
    return res.status(400).json({
      status: 'error',
      error: details.map((detail) => detail.message).join('; '),
      details,
    });
  }

  if (validated.params) req.params = validated.params;
  if (validated.body) req.body = validated.body;
  if (validated.query) req.validatedQuery = validated.query;

  return next();
};
