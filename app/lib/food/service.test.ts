/**
 * Tests for Food Search Service
 */

import { apiClient } from '../http';
import { FoodSearchService } from './service';
import type { FoodDetailsResponse, FoodItem, FoodSearchResponse } from './types';

// Mock the apiClient
jest.mock('../http', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('FoodSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockFoodItem: FoodItem = {
    fdcId: 123456,
    description: 'Apple, raw',
    dataType: 'SR Legacy',
    foodCategory: 'Fruits and Fruit Juices',
    foodNutrients: [
      {
        nutrientId: 1008,
        nutrientName: 'Energy',
        nutrientNumber: '208',
        unitName: 'kcal',
        value: 52,
      },
      {
        nutrientId: 1003,
        nutrientName: 'Protein',
        nutrientNumber: '203',
        unitName: 'g',
        value: 0.26,
      },
    ],
    score: 1234.5,
  };

  const mockSearchResponse: FoodSearchResponse = {
    totalHits: 100,
    currentPage: 1,
    totalPages: 4,
    foods: [mockFoodItem],
  };

  describe('searchFoods', () => {
    it('should call GET /usda/fdc/v1/foods/search with query parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      const result = await FoodSearchService.searchFoods('apple');

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: { query: 'apple' },
      });
      expect(result).toEqual(mockSearchResponse);
    });

    it('should include optional parameters when provided', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoods('banana', {
        pageSize: 50,
        pageNumber: 2,
        sortBy: 'fdcId',
        sortOrder: 'desc',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'banana',
          pageSize: 50,
          pageNumber: 2,
          sortBy: 'fdcId',
          sortOrder: 'desc',
        },
      });
    });

    it('should handle dataType array parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoods('chicken', {
        dataType: ['Branded', 'SR Legacy'],
      });

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'chicken',
          dataType: 'Branded,SR Legacy',
        },
      });
    });

    it('should handle brandOwner parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoods('yogurt', {
        brandOwner: 'Chobani',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'yogurt',
          brandOwner: 'Chobani',
        },
      });
    });

    it('should return search results with foods array', async () => {
      const multipleResults: FoodSearchResponse = {
        totalHits: 3,
        currentPage: 1,
        totalPages: 1,
        foods: [
          mockFoodItem,
          { ...mockFoodItem, fdcId: 123457, description: 'Apple juice' },
          { ...mockFoodItem, fdcId: 123458, description: 'Apple pie' },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(multipleResults);

      const result = await FoodSearchService.searchFoods('apple');

      expect(result.foods).toHaveLength(3);
      expect(result.totalHits).toBe(3);
    });

    it('should handle empty search results', async () => {
      const emptyResponse: FoodSearchResponse = {
        totalHits: 0,
        currentPage: 1,
        totalPages: 0,
        foods: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(emptyResponse);

      const result = await FoodSearchService.searchFoods('nonexistentfood123');

      expect(result.foods).toEqual([]);
      expect(result.totalHits).toBe(0);
    });
  });

  describe('getFoodDetails', () => {
    it('should call GET /usda/fdc/v1/food/{fdcId}', async () => {
      const mockDetails: FoodDetailsResponse = {
        ...mockFoodItem,
        servingSize: 100,
        servingSizeUnit: 'g',
        ingredients: 'Apple',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockDetails);

      const result = await FoodSearchService.getFoodDetails(123456);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/food/123456');
      expect(result).toEqual(mockDetails);
    });

    it('should return detailed food information with nutrients', async () => {
      const detailedFood: FoodDetailsResponse = {
        fdcId: 123456,
        description: 'Banana, raw',
        dataType: 'SR Legacy',
        servingSize: 118,
        servingSizeUnit: 'g',
        foodNutrients: [
          {
            nutrientId: 1008,
            nutrientName: 'Energy',
            nutrientNumber: '208',
            unitName: 'kcal',
            value: 89,
          },
          {
            nutrientId: 1005,
            nutrientName: 'Carbohydrate, by difference',
            nutrientNumber: '205',
            unitName: 'g',
            value: 22.84,
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(detailedFood);

      const result = await FoodSearchService.getFoodDetails(123456);

      expect(result.foodNutrients).toBeDefined();
      expect(result.foodNutrients?.length).toBeGreaterThan(0);
      expect(result.servingSize).toBe(118);
    });
  });

  describe('searchFoodsPaginated', () => {
    it('should call searchFoods with pagination parameters', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsPaginated('apple', 2, 50);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'apple',
          pageNumber: 2,
          pageSize: 50,
        },
      });
    });

    it('should use default pagination values when not provided', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsPaginated('apple');

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'apple',
          pageNumber: 1,
          pageSize: 25,
        },
      });
    });

    it('should limit pageSize to API maximum of 200', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsPaginated('apple', 1, 500);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'apple',
          pageNumber: 1,
          pageSize: 200,
        },
      });
    });

    it('should handle multiple pages', async () => {
      const page1Response: FoodSearchResponse = {
        totalHits: 100,
        currentPage: 1,
        totalPages: 4,
        foods: [mockFoodItem],
      };

      const page2Response: FoodSearchResponse = {
        totalHits: 100,
        currentPage: 2,
        totalPages: 4,
        foods: [{ ...mockFoodItem, fdcId: 123457 }],
      };

      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      const result1 = await FoodSearchService.searchFoodsPaginated('apple', 1);
      const result2 = await FoodSearchService.searchFoodsPaginated('apple', 2);

      expect(result1.currentPage).toBe(1);
      expect(result2.currentPage).toBe(2);
    });
  });

  describe('searchFoodsByBrand', () => {
    it('should call searchFoods with brandOwner parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsByBrand('yogurt', 'Chobani');

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'yogurt',
          brandOwner: 'Chobani',
        },
      });
    });

    it('should filter results by brand', async () => {
      const brandedResponse: FoodSearchResponse = {
        totalHits: 5,
        currentPage: 1,
        totalPages: 1,
        foods: [
          {
            ...mockFoodItem,
            description: 'Chobani Greek Yogurt',
            brandOwner: 'Chobani',
            dataType: 'Branded',
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValue(brandedResponse);

      const result = await FoodSearchService.searchFoodsByBrand('yogurt', 'Chobani');

      expect(result.foods[0].brandOwner).toBe('Chobani');
    });
  });

  describe('searchFoodsByType', () => {
    it('should call searchFoods with dataType parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsByType('chicken', ['Branded', 'SR Legacy']);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'chicken',
          dataType: 'Branded,SR Legacy',
        },
      });
    });

    it('should filter results by single data type', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsByType('apple', ['SR Legacy']);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'apple',
          dataType: 'SR Legacy',
        },
      });
    });

    it('should handle multiple data types', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      await FoodSearchService.searchFoodsByType('bread', [
        'Branded',
        'SR Legacy',
        'Foundation',
      ]);

      expect(apiClient.get).toHaveBeenCalledWith('/usda/fdc/v1/foods/search', {
        params: {
          query: 'bread',
          dataType: 'Branded,SR Legacy,Foundation',
        },
      });
    });
  });

  describe('Service Integration', () => {
    it('should have all search methods available', () => {
      expect(FoodSearchService.searchFoods).toBeDefined();
      expect(FoodSearchService.getFoodDetails).toBeDefined();
      expect(FoodSearchService.searchFoodsPaginated).toBeDefined();
      expect(FoodSearchService.searchFoodsByBrand).toBeDefined();
      expect(FoodSearchService.searchFoodsByType).toBeDefined();
    });

    it('should all return promises', () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockSearchResponse);

      const searchPromise = FoodSearchService.searchFoods('apple');
      const detailsPromise = FoodSearchService.getFoodDetails(123456);
      const paginatedPromise = FoodSearchService.searchFoodsPaginated('apple');

      expect(searchPromise).toBeInstanceOf(Promise);
      expect(detailsPromise).toBeInstanceOf(Promise);
      expect(paginatedPromise).toBeInstanceOf(Promise);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(FoodSearchService.searchFoods('apple')).rejects.toThrow('API Error');
    });
  });
});
