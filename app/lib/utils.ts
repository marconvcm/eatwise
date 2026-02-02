// Function to infer emoji based on meal subject
export function inferEmojiFromSubject(subject: string): string {
  const lowerSubject = subject.toLowerCase();

  // Dairy & Breakfast
  if (lowerSubject.match(/yogurt|yoghurt/)) return "🥛";
  if (lowerSubject.match(/milk|latte|cappuccino/)) return "☕";
  if (lowerSubject.match(/cheese/)) return "🧀";
  if (lowerSubject.match(/egg|omelette|omelet/)) return "🥚";
  if (lowerSubject.match(/cereal|granola|oatmeal|oats/)) return "🥣";
  if (lowerSubject.match(/pancake|waffle/)) return "🥞";
  if (lowerSubject.match(/bacon/)) return "🥓";
  
  // Fruits
  if (lowerSubject.match(/apple/)) return "🍎";
  if (lowerSubject.match(/banana/)) return "🍌";
  if (lowerSubject.match(/orange|citrus/)) return "🍊";
  if (lowerSubject.match(/grape/)) return "🍇";
  if (lowerSubject.match(/strawberr|berr/)) return "🍓";
  if (lowerSubject.match(/watermelon/)) return "🍉";
  if (lowerSubject.match(/pineapple/)) return "🍍";
  if (lowerSubject.match(/peach/)) return "🍑";
  if (lowerSubject.match(/cherry|cherries/)) return "🍒";
  if (lowerSubject.match(/lemon/)) return "🍋";
  if (lowerSubject.match(/kiwi/)) return "🥝";
  if (lowerSubject.match(/avocado/)) return "🥑";
  
  // Vegetables
  if (lowerSubject.match(/salad|lettuce/)) return "🥗";
  if (lowerSubject.match(/carrot/)) return "🥕";
  if (lowerSubject.match(/broccoli/)) return "🥦";
  if (lowerSubject.match(/tomato/)) return "🍅";
  if (lowerSubject.match(/cucumber/)) return "🥒";
  if (lowerSubject.match(/pepper|capsicum/)) return "🫑";
  if (lowerSubject.match(/corn/)) return "🌽";
  if (lowerSubject.match(/potato|fries|chips/)) return "🍟";
  
  // Proteins
  if (lowerSubject.match(/chicken|poultry/)) return "🍗";
  if (lowerSubject.match(/steak|beef|meat/)) return "🥩";
  if (lowerSubject.match(/burger|hamburger/)) return "🍔";
  if (lowerSubject.match(/hot.?dog|hotdog/)) return "🌭";
  if (lowerSubject.match(/fish|salmon|tuna/)) return "🐟";
  if (lowerSubject.match(/shrimp|prawn/)) return "🍤";
  if (lowerSubject.match(/sushi/)) return "🍣";
  
  // Carbs & Grains
  if (lowerSubject.match(/pizza/)) return "🍕";
  if (lowerSubject.match(/pasta|spaghetti|noodle/)) return "🍝";
  if (lowerSubject.match(/bread|toast|sandwich/)) return "🍞";
  if (lowerSubject.match(/rice/)) return "🍚";
  if (lowerSubject.match(/taco/)) return "🌮";
  if (lowerSubject.match(/burrito/)) return "🌯";
  
  // Desserts & Sweets
  if (lowerSubject.match(/cake/)) return "🍰";
  if (lowerSubject.match(/cookie|biscuit/)) return "🍪";
  if (lowerSubject.match(/chocolate|candy/)) return "🍫";
  if (lowerSubject.match(/ice.?cream|gelato/)) return "🍦";
  if (lowerSubject.match(/donut|doughnut/)) return "🍩";
  if (lowerSubject.match(/pie/)) return "🥧";
  if (lowerSubject.match(/cupcake/)) return "🧁";
  
  // Drinks
  if (lowerSubject.match(/water/)) return "💧";
  if (lowerSubject.match(/juice/)) return "🧃";
  if (lowerSubject.match(/soda|cola|pop/)) return "🥤";
  if (lowerSubject.match(/beer/)) return "🍺";
  if (lowerSubject.match(/wine/)) return "🍷";
  if (lowerSubject.match(/cocktail/)) return "🍹";
  if (lowerSubject.match(/tea/)) return "🍵";
  
  // Snacks
  if (lowerSubject.match(/popcorn/)) return "🍿";
  if (lowerSubject.match(/pretzel/)) return "🥨";
  if (lowerSubject.match(/nut|almond|cashew|peanut/)) return "🥜";
  
  // Default
  return "🍽️";
}
