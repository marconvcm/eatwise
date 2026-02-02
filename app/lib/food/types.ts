/**
 * USDA FoodData Central API Types
 * Based on https://api.nal.usda.gov/fdc/v1 API documentation
 */

export interface FoodSearchCriteria {
  query: string;
  dataType?: string[];
  pageSize?: number;
  pageNumber?: number;
  sortBy?: 'dataType.keyword' | 'lowercaseDescription.keyword' | 'fdcId' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
  brandOwner?: string;
}

export interface FoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  derivationCode?: string;
  derivationDescription?: string;
  derivationId?: number;
  value: number;
  foodNutrientSourceId?: number;
  foodNutrientSourceCode?: string;
  foodNutrientSourceDescription?: string;
  rank?: number;
  indentLevel?: number;
  foodNutrientId?: number;
}

export interface FoodPortion {
  id: number;
  amount: number;
  dataPoints?: number;
  gramWeight: number;
  minYearAcquired?: number;
  modifier: string;
  portionDescription: string;
  sequenceNumber: number;
}

export interface FoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  publicationDate?: string;
  brandOwner?: string;
  brandName?: string;
  ingredients?: string;
  marketCountry?: string;
  foodCategory?: string;
  modifiedDate?: string;
  dataSource?: string;
  packageWeight?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  allHighlightFields?: string;
  score?: number;
  foodNutrients?: FoodNutrient[];
  foodPortions?: FoodPortion[];
  foodAttributes?: Array<{
    id: number;
    sequenceNumber: number;
    value: string;
    foodAttributeType: {
      id: number;
      name: string;
      description: string;
    };
  }>;
  foodCode?: string;
  gtinUpc?: string;
  ndbNumber?: string;
  additionalDescriptions?: string;
}

export interface FoodSearchResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  pageList?: number[];
  foodSearchCriteria?: FoodSearchCriteria;
  foods: FoodItem[];
  aggregations?: {
    dataType?: {
      [key: string]: number;
    };
    nutrients?: {
      [key: string]: number;
    };
  };
}

export interface FoodDetailsResponse extends FoodItem {
  inputFoods?: Array<{
    id: number;
    foodDescription: string;
    inputFood: {
      id: number;
      foodDescription: string;
      inputFood: FoodItem;
    };
  }>;
  nutrientConversionFactors?: Array<{
    type: string;
    value: number;
  }>;
  isHistoricalReference?: boolean;
  scientificName?: string;
}
