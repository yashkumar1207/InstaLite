function parsePagination(query) {
  const page = parseInt(query.page ?? 1, 10);
  const limit = parseInt(query.limit ?? 10, 10);

  if (isNaN(page) || page < 1) {
    const err = new Error('page must be a positive integer');
    err.status = 400;
    throw err;
  }
  if (isNaN(limit) || limit < 1 || limit > 100) {
    const err = new Error('limit must be between 1 and 100');
    err.status = 400;
    throw err;
  }

  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { parsePagination, buildMeta };
