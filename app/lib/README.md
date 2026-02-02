# App Context and Hooks Usage

## AppContext

The `AppContext` provides centralized access to all API services throughout your React Native app.

### Setup

The `AppProvider` is already configured in `app/_layout.tsx` and wraps your entire app.

### Usage

```tsx
import { useAppServices } from '@/lib';

function MyComponent() {
  const { ledger, userProfile, foodSearch } = useAppServices();

  const handleGetProfile = async () => {
    const profile = await userProfile.getProfile();
    console.log(profile);
  };

  const handleSearchFood = async () => {
    const results = await foodSearch.searchFoods('apple');
    console.log(results);
  };

  return (
    // Your component JSX
  );
}
```

### Available Services

- `ledger` - User ledger operations (get, create, update, delete entries)
- `ledgerAdmin` - Admin ledger operations (manage all user entries)
- `adminReport` - Admin dashboard reports and analytics
- `userProfile` - User profile management and invitations
- `foodSearch` - USDA food database search

## Debounced Food Search Hook

The `useDebouncedFoodSearch` hook prevents excessive API calls while the user types in a search field. With only 1000 API calls per hour allowed, this is essential.

### Usage Example

```tsx
import { useState } from "react";
import { TextInput, FlatList, Text } from "react-native";
import { useDebouncedFoodSearch } from "@/lib";

function FoodSearchComponent() {
  const [query, setQuery] = useState("");

  // Hook automatically debounces searches (default: 500ms delay)
  const { data, loading, error } = useDebouncedFoodSearch(query, {
    delay: 500, // Optional: custom delay in ms
    enabled: query.length > 2, // Optional: only search if query > 2 chars
    searchOptions: {
      // Optional: additional USDA API options
      pageSize: 25,
      brandOwner: "Chobani",
    },
  });

  return (
    <>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for foods..."
      />

      {loading && <Text>Searching...</Text>}
      {error && <Text>Error: {error.message}</Text>}

      {data && (
        <FlatList
          data={data.foods}
          renderItem={({ item }) => <Text>{item.description}</Text>}
          keyExtractor={(item) => String(item.fdcId)}
        />
      )}
    </>
  );
}
```

### How It Works

1. User types "a" → No API call (waiting for debounce delay)
2. User types "ap" → No API call (still waiting)
3. User types "app" → No API call (still waiting)
4. User types "appl" → No API call (still waiting)
5. User types "apple" → Waits 500ms → **Single API call** made

This reduces 5 potential API calls to just 1!

## useDebounce Hook

Generic debounce hook for any value.

```tsx
import { useState } from "react";
import { useDebounce } from "@/lib";

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use debouncedSearchTerm for API calls
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Make API call with debouncedSearchTerm
    }
  }, [debouncedSearchTerm]);

  return <TextInput value={searchTerm} onChangeText={setSearchTerm} />;
}
```

## Direct Service Usage (Without Hook)

You can also use services directly without the context:

```tsx
import { FoodSearchService } from "@/lib/food/service";
import { UserProfileService } from "@/lib/user/service";

async function searchFood() {
  const results = await FoodSearchService.searchFoods("apple");
  return results;
}

async function getProfile() {
  const profile = await UserProfileService.getProfile();
  return profile;
}
```

## API Rate Limiting Best Practices

### USDA FoodData Central: 1000 requests/hour

1. **Always use `useDebouncedFoodSearch`** for search-as-you-type features
2. **Increase debounce delay** for slower typers: `{ delay: 800 }`
3. **Add minimum query length**: `{ enabled: query.length > 3 }`
4. **Cache results** when possible
5. **Show loading states** to indicate searches are in progress

### Example with All Best Practices

```tsx
function FoodSearchWithBestPractices() {
  const [query, setQuery] = useState("");

  const { data, loading, error } = useDebouncedFoodSearch(query, {
    delay: 800, // Longer delay
    enabled: query.trim().length > 3, // Min 4 characters
    searchOptions: {
      pageSize: 50, // More results per call
    },
  });

  return (
    <>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Type at least 4 characters..."
      />
      {query.length > 0 && query.length < 4 && (
        <Text>Keep typing... (need 4+ characters)</Text>
      )}
      {loading && <Text>Searching...</Text>}
      {/* Rest of component */}
    </>
  );
}
```
