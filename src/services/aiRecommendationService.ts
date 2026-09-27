import { Product, UserPreferences, AIRecommendation } from '../types';

export function getSmartRecommendations(
  products: Product[],
  preferences: UserPreferences,
  favourites: Set<number>,
  dislikes: Set<number>
): AIRecommendation[] {
  // Filter out disliked products
  let candidates = products.filter(p => !dislikes.has(p.id));

  // Hard filter based on dietary restrictions
  const isVegetarianOrVegan = preferences.dietaryNeeds.some(d =>
    d.toLowerCase().includes('vegetarian') || d.toLowerCase().includes('vegan')
  );

  if (isVegetarianOrVegan) {
    candidates = candidates.filter(p => p.category !== 'Meat');
  }

  // Filter out allergens
  if (preferences.allergies && preferences.allergies.length > 0) {
    const allergyKeywords = preferences.allergies.map(a => a.toLowerCase());
    candidates = candidates.filter(p => {
      if (!p.dietaryTags) return true;
      return !p.dietaryTags.some(tag =>
        allergyKeywords.some(keyword => tag.includes(keyword) || keyword.includes(tag))
      );
    });
  }

  // Generate personalized rationale based on cooking style, lifestyle, and price
  const recommendations: AIRecommendation[] = candidates
    .slice(0, 10)
    .map((product, idx) => {
      let reason = 'Great value pantry essential';

      if (product.category === 'Fruits') {
        reason = `Rich in antioxidants and quick natural fuel for your ${preferences.lifestyle} routine.`;
      } else if (product.category === 'Vegetables') {
        reason = `Nutrient-dense staple that complements your ${preferences.cookingStyle} meal prep.`;
      } else if (product.category === 'Meat') {
        reason = `High-protein centerpiece with great price-per-gram at ${product.retailer}.`;
      } else if (product.category === 'Rice') {
        reason = `Economical whole-grain base ideal for ${preferences.cookingStyle}.`;
      } else if (product.category === 'Dairy,Eggs & Milk') {
        reason = `Versatile morning protein matching your ${preferences.shoppingFrequency} grocery cadence.`;
      } else if (product.category === 'Snacks') {
        reason = `Controlled indulgence fitting your ${preferences.productStyle} shopping plan.`;
      }

      // Add special flag if already favourited
      const isFav = favourites.has(product.id);
      if (isFav) {
        reason = `One of your saved favourites on special at ${product.retailer}!`;
      }

      return {
        id: idx + 1,
        productId: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        retailer: product.retailer,
        imageUrl: product.imageUrl,
        reason,
        isFavourite: isFav,
      };
    });

  return recommendations;
}
