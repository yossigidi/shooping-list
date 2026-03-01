import { PRODUCT_PRICES, WEIGHT_BASED_PRICES, STORE_CHAINS, getChainColor } from '../data/prices';

const PRICES_API_URL = '/api/prices';

// Check if product is sold by weight
export function isWeightBasedProduct(productName) {
  // If product exists in PRODUCT_PRICES, it's sold by unit
  if (PRODUCT_PRICES[productName]) {
    return false;
  }

  // Check partial matches in PRODUCT_PRICES
  for (const product of Object.keys(PRODUCT_PRICES)) {
    if (product.includes(productName) || productName.includes(product)) {
      return false;
    }
  }

  // Check if in WEIGHT_BASED_PRICES
  if (WEIGHT_BASED_PRICES[productName]) {
    return true;
  }

  // Check partial matches in WEIGHT_BASED_PRICES
  for (const product of Object.keys(WEIGHT_BASED_PRICES)) {
    if (product.includes(productName) || productName.includes(product)) {
      return true;
    }
  }

  return false;
}

// Get weight-based price (price per kg)
export function getWeightBasedPrice(productName) {
  // Check if product is actually sold by unit
  if (PRODUCT_PRICES[productName]) {
    return null;
  }

  // Check partial matches in PRODUCT_PRICES
  for (const product of Object.keys(PRODUCT_PRICES)) {
    if (product.includes(productName) || productName.includes(product)) {
      return null;
    }
  }

  // Check weight-based prices
  if (WEIGHT_BASED_PRICES[productName]) {
    return WEIGHT_BASED_PRICES[productName];
  }

  // Check partial matches
  for (const [product, pricePerKg] of Object.entries(WEIGHT_BASED_PRICES)) {
    if (product.includes(productName) || productName.includes(product)) {
      return pricePerKg;
    }
  }

  return null;
}

// Get estimated price for a product
export function getEstimatedPrice(productName) {
  // Direct match
  if (PRODUCT_PRICES[productName]) {
    return PRODUCT_PRICES[productName];
  }

  // Partial match
  for (const [product, price] of Object.entries(PRODUCT_PRICES)) {
    if (product.includes(productName) || productName.includes(product)) {
      return price;
    }
  }

  // Fuzzy match
  const lowerName = productName.toLowerCase();
  for (const [product, price] of Object.entries(PRODUCT_PRICES)) {
    if (lowerName.includes(product.toLowerCase()) || product.toLowerCase().includes(lowerName)) {
      return price;
    }
  }

  return null;
}

// Calculate total price for an item with quantity
export function calculateItemPrice(item) {
  const { name, quantity = 1, unit = 'pcs' } = item;

  // Check for weight-based pricing
  const weightPrice = getWeightBasedPrice(name);
  if (weightPrice && (unit === 'kg' || unit === 'g')) {
    // Convert grams to kg if needed
    const kgQuantity = unit === 'g' ? quantity / 1000 : quantity;
    return Math.round(weightPrice * kgQuantity * 100) / 100;
  }

  // Unit-based pricing
  const unitPrice = getEstimatedPrice(name);
  if (unitPrice) {
    return Math.round(unitPrice * quantity * 100) / 100;
  }

  return null;
}

// Calculate total for shopping list
export function calculateListTotal(items) {
  let total = 0;
  let itemsWithPrices = 0;

  for (const item of items) {
    const price = calculateItemPrice(item);
    if (price !== null) {
      total += price;
      itemsWithPrices++;
    }
  }

  return {
    total: Math.round(total * 100) / 100,
    itemsWithPrices,
    totalItems: items.length,
    coverage: items.length > 0 ? Math.round((itemsWithPrices / items.length) * 100) : 0
  };
}

// Fetch prices from API
export async function fetchPricesFromAPI() {
  try {
    const response = await fetch(`${PRICES_API_URL}?action=avgprices`);
    if (response.ok) {
      const data = await response.json();
      if (data.prices) {
        // Update local prices with API data
        Object.assign(PRODUCT_PRICES, data.prices);
        return data.prices;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch prices from API:', error);
  }
  return null;
}

// Fetch promotions from API
export async function fetchPromotions() {
  try {
    const response = await fetch(`${PRICES_API_URL}?action=promotions`);
    if (response.ok) {
      const data = await response.json();
      return data.promotions || [];
    }
  } catch (error) {
    console.warn('Failed to fetch promotions:', error);
  }
  return [];
}

// Compare prices across chains for a product
export async function comparePrices(productName) {
  try {
    const response = await fetch(`/api/compare?action=search&q=${encodeURIComponent(productName)}`);
    if (response.ok) {
      const data = await response.json();
      if (data.found && data.prices) {
        // Normalize: API returns {chain_id, chain_name, price} → ensure {chain, price}
        return data.prices.map(p => ({
          chain: p.chain_name || p.chain || p.chain_id,
          price: p.price,
          chain_id: p.chain_id
        }));
      }
    }
  } catch (error) {
    console.warn('Failed to compare prices:', error);
  }

  // Return local estimate as fallback
  const price = getEstimatedPrice(productName);
  if (price) {
    return [{
      chain: 'מחיר משוער',
      price: price,
      isEstimate: true
    }];
  }

  return [];
}

// Optimize shopping basket across chains
export async function optimizeBasket(items) {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.warn('Failed to optimize basket:', error);
  }

  // Local fallback
  return {
    recommendation: 'לא ניתן לבצע השוואה כרגע',
    stores: []
  };
}

// Get search suggestions based on input
export function getPriceSearchSuggestions(searchTerm, limit = 10) {
  if (!searchTerm || searchTerm.length < 2) return [];

  const lowerSearch = searchTerm.toLowerCase();
  const suggestions = [];

  for (const [product, price] of Object.entries(PRODUCT_PRICES)) {
    if (product.toLowerCase().includes(lowerSearch)) {
      suggestions.push({
        name: product,
        price: price,
        type: 'unit'
      });
    }
    if (suggestions.length >= limit) break;
  }

  // Also check weight-based products
  for (const [product, pricePerKg] of Object.entries(WEIGHT_BASED_PRICES)) {
    if (product.toLowerCase().includes(lowerSearch) && suggestions.length < limit) {
      // Don't add if already in suggestions
      if (!suggestions.find(s => s.name === product)) {
        suggestions.push({
          name: product,
          price: pricePerKg,
          type: 'weight',
          unit: 'ק"ג'
        });
      }
    }
  }

  return suggestions.slice(0, limit);
}

// Check if a promotion is relevant to current list items
export function isPromotionRelevant(promotion, items) {
  const promoNameLower = promotion.productName?.toLowerCase() || '';
  const promoCategoryLower = promotion.category?.toLowerCase() || '';

  return items.some(item => {
    const itemNameLower = item.name.toLowerCase();
    return (
      promoNameLower.includes(itemNameLower) ||
      itemNameLower.includes(promoNameLower) ||
      promoCategoryLower === item.category
    );
  });
}

// Get promotions relevant to specific item
export function getItemPromotions(item, promotions) {
  const itemNameLower = item.name.toLowerCase();

  return promotions.filter(promo => {
    const promoNameLower = promo.productName?.toLowerCase() || '';
    return (
      promoNameLower.includes(itemNameLower) ||
      itemNameLower.includes(promoNameLower)
    );
  });
}

// Format price for display
export function formatPrice(price, currency = '₪') {
  if (price === null || price === undefined) return '-';
  return `${price.toFixed(2)}${currency}`;
}

// Export chain utilities
export { STORE_CHAINS, getChainColor };
