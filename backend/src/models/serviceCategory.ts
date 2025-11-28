import { pool } from '../config/database';
import {
  ServiceCategory,
  CategorySpecialization,
  CategoryWithSpecializations,
} from '../types/serviceCategory';

// Object literal for service category operations
export const ServiceCategoryModel = {
  /**
   * Get all active categories
   */
  async findAll(): Promise<ServiceCategory[]> {
    const query = `
      SELECT * FROM service_categories
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Get category by ID
   */
  async findById(id: number): Promise<ServiceCategory | null> {
    const query = 'SELECT * FROM service_categories WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  },

  /**
   * Get category by ID with its specializations
   */
  async findByIdWithSpecializations(id: number): Promise<CategoryWithSpecializations | null> {
    // First get the category
    const category = await ServiceCategoryModel.findById(id);

    if (!category) {
      return null;
    }

    // Then get its specializations
    const specializations = await ServiceCategoryModel.findSpecializationsByCategoryId(id);

    return {
      ...category,
      specializations,
    };
  },

  /**
   * Get all categories with their specializations
   */
  async findAllWithSpecializations(): Promise<CategoryWithSpecializations[]> {
    // Get all active categories
    const categories = await ServiceCategoryModel.findAll();

    // Get all active specializations in one query for efficiency
    const specializationsQuery = `
      SELECT * FROM category_specializations
      WHERE is_active = true
      ORDER BY display_order ASC, name ASC
    `;
    const specializationsResult = await pool.query(specializationsQuery);
    const allSpecializations: CategorySpecialization[] = specializationsResult.rows;

    // Group specializations by category_id
    const specializationsByCategory = allSpecializations.reduce((acc, spec) => {
      if (!acc[spec.category_id]) {
        acc[spec.category_id] = [];
      }
      acc[spec.category_id].push(spec);
      return acc;
    }, {} as Record<number, CategorySpecialization[]>);

    // Combine categories with their specializations
    return categories.map(category => ({
      ...category,
      specializations: specializationsByCategory[category.id] || [],
    }));
  },

  /**
   * Get specializations by category ID
   */
  async findSpecializationsByCategoryId(categoryId: number): Promise<CategorySpecialization[]> {
    const query = `
      SELECT * FROM category_specializations
      WHERE category_id = $1 AND is_active = true
      ORDER BY display_order ASC, name ASC
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows;
  },

  /**
   * Get a single specialization by ID
   */
  async findSpecializationById(id: number): Promise<CategorySpecialization | null> {
    const query = 'SELECT * FROM category_specializations WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  },

  /**
   * Get multiple specializations by IDs
   */
  async findSpecializationsByIds(ids: number[]): Promise<CategorySpecialization[]> {
    if (ids.length === 0) {
      return [];
    }

    const query = `
      SELECT * FROM category_specializations
      WHERE id = ANY($1) AND is_active = true
      ORDER BY category_id ASC, display_order ASC, name ASC
    `;
    const result = await pool.query(query, [ids]);
    return result.rows;
  },

  /**
   * Get specializations by IDs with their category information
   */
  async findSpecializationsWithCategoryByIds(ids: number[]): Promise<(CategorySpecialization & { category_name: string })[]> {
    if (ids.length === 0) {
      return [];
    }

    const query = `
      SELECT
        cs.*,
        sc.name as category_name
      FROM category_specializations cs
      JOIN service_categories sc ON cs.category_id = sc.id
      WHERE cs.id = ANY($1) AND cs.is_active = true
      ORDER BY sc.display_order ASC, cs.display_order ASC
    `;
    const result = await pool.query(query, [ids]);
    return result.rows;
  },

  /**
   * Count all active categories
   */
  async countCategories(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM service_categories WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  /**
   * Count all active specializations
   */
  async countSpecializations(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM category_specializations WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },

  /**
   * Count specializations for a specific category
   */
  async countSpecializationsByCategory(categoryId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM category_specializations
      WHERE category_id = $1 AND is_active = true
    `;
    const result = await pool.query(query, [categoryId]);
    return parseInt(result.rows[0].count);
  },
};
