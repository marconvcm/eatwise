/**
 * Food Search API Service
 * Interfaces with USDA FoodData Central API through Spring Cloud Gateway proxy
 */

import { apiClient } from '../http';
import type {
  FoodDetailsResponse,
  FoodSearchCriteria,
  FoodSearchResponse,
} from './types';

export const FoodSearchService = {
  autoCompleteLookupTimeoutId: null as number | null,

  /**
   * Search for foods using USDA FoodData Central API
   * GET /usda/fdc/v1/foods/search
   * @param query - Search query string
   * @param options - Additional search criteria (pageSize, pageNumber, sortBy, etc.)
   * @returns Search results with food items
   */
  async searchFoods(
    query: string,
    options?: Partial<Omit<FoodSearchCriteria, 'query'>>
  ): Promise<FoodSearchResponse> {
    const params: Record<string, string | number> = {
      query,
      ...(options?.pageSize && { pageSize: options.pageSize }),
      ...(options?.pageNumber && { pageNumber: options.pageNumber }),
      ...(options?.sortBy && { sortBy: options.sortBy }),
      ...(options?.sortOrder && { sortOrder: options.sortOrder }),
      ...(options?.brandOwner && { brandOwner: options.brandOwner }),
    };

    // Handle array parameters (dataType)
    if (options?.dataType && options.dataType.length > 0) {
      params.dataType = options.dataType.join(',');
    }

    return apiClient.get<FoodSearchResponse>('/usda/fdc/v1/foods/search', { params });
  },

  /**
   * Get detailed information about a specific food item
   * GET /usda/fdc/v1/food/{fdcId}
   * @param fdcId - FDC ID of the food item
   * @returns Detailed food information with nutrients
   */
  async getFoodDetails(fdcId: number): Promise<FoodDetailsResponse> {
    return apiClient.get<FoodDetailsResponse>(`/usda/fdc/v1/food/${fdcId}`);
  },

  /**
   * Search foods with pagination helper
   * Automatically handles pagination parameters
   * @param query - Search query string
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of results per page (default: 25, max: 200)
   * @returns Search results for the specified page
   */
  async searchFoodsPaginated(
    query: string,
    page: number = 1,
    pageSize: number = 25
  ): Promise<FoodSearchResponse> {
    return this.searchFoods(query, {
      pageNumber: page,
      pageSize: Math.min(pageSize, 200), // API max is 200
    });
  },

  /**
   * Search foods by brand
   * 
   * @param query - Search query string
   * @param brandOwner - Brand owner name
   * @returns Search results filtered by brand
   */
  async searchFoodsByBrand(
    query: string,
    brandOwner: string
  ): Promise<FoodSearchResponse> {
    return this.searchFoods(query, { brandOwner });
  },

  /**
   * Search foods by data type
   * 
   * @param query - Search query string
   * @param dataTypes - Array of data types to filter by
   *                   (e.g., ['Branded', 'SR Legacy', 'Foundation'])
   * @returns Search results filtered by data types
   */
  async searchFoodsByType(
    query: string,
    dataTypes: string[]
  ): Promise<FoodSearchResponse> {
    return this.searchFoods(query, { dataType: dataTypes });
  },

  /**
   * Search foods for autocomplete lookup with built-in debounce
   * Returns a key-value object where keys are fdcId and values are display labels
   * @param value - Search query string
   * @returns Object with fdcId as keys and formatted labels as values
   */
  async autoCompleteLookup(value: string): Promise<Record<string, string>> {
    return new Promise((resolve) => {
      if (this.autoCompleteLookupTimeoutId) {
        clearTimeout(this.autoCompleteLookupTimeoutId);
      }
      
      if (!value || value.trim().length < 2) {
        resolve({});
        return;
      }
      
      this.autoCompleteLookupTimeoutId = setTimeout(async () => {
        try {
          const response = await this.searchFoods(value, { pageSize: 10 });
          
          const results = Object.fromEntries(
            response.foods.map(food => [
              food.fdcId.toString(),
              `${food.description} (${food.brandName || food.dataType || 'Generic'})`
            ])
          );

          resolve(results);
        } catch (error) {
          console.error('Autocomplete lookup failed:', error);
          resolve({});
        }
      }, 300);
    });
  },

  /**
   * Get food details for autocomplete pickup
   * Returns the selected food's details formatted for form population
   * @param fdcId - The selected food's FDC ID
   * @returns Object with subject and calories fields
   */
  async autoCompletePickup(fdcId: string): Promise<{ subject: string; calories: number }> {
    try {
      const food = await this.getFoodDetails(Number(fdcId));

      const calories = food.labelNutrients?.["calories"].value ?? 0

      return {
        subject: `${food.description} (${food.brandName || food.dataType || 'Generic'})`,
        calories: calories,
      };
    } catch (error) {
      console.error('Autocomplete pickup failed:', error);
      return {
        subject: '',
        calories: 0,
      };
    }
  },

  
};
