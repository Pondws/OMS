const getPagination = (page: number, limit: number) => {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}

const getPaginationMeta = (
  page: number,
  limit: number,
  total: number,
) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}

export {
  getPagination,
  getPaginationMeta,
}