import { parsePagination, buildPaginatedResponse } from '../../utils/pagination';

describe('pagination utils', () => {
  describe('parsePagination', () => {
    it('returns defaults when query is empty', () => {
      const result = parsePagination({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('parses page and limit', () => {
      const result = parsePagination({ page: '3', limit: '10' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(20);
    });

    it('uses defaultSort when provided', () => {
      const result = parsePagination({}, 'name');
      expect(result.sortBy).toBe('name');
    });

    it('accepts order asc', () => {
      const result = parsePagination({ order: 'asc' });
      expect(result.sortOrder).toBe('asc');
    });

    it('caps limit at MAX_LIMIT 100', () => {
      const result = parsePagination({ limit: '200' });
      expect(result.limit).toBe(100);
    });
  });

  describe('buildPaginatedResponse', () => {
    it('builds correct pagination meta', () => {
      const pagination = { page: 2, limit: 10, skip: 10, sortBy: 'createdAt', sortOrder: 'desc' as const };
      const res = buildPaginatedResponse([{ id: 1 }], 25, pagination);
      expect(res.data).toHaveLength(1);
      expect(res.pagination.page).toBe(2);
      expect(res.pagination.limit).toBe(10);
      expect(res.pagination.total).toBe(25);
      expect(res.pagination.totalPages).toBe(3);
      expect(res.pagination.hasNext).toBe(true);
      expect(res.pagination.hasPrev).toBe(true);
    });
  });
});
