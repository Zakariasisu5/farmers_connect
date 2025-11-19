/**
 * Crop Measurement Units
 * Comprehensive mapping of crops to their appropriate measurement units
 * Used for market pricing and crop listings
 */

// Common crop categories and their standard units
export interface CropUnitMapping {
  primary: string;
  alternatives: string[];
  description?: string;
}

// Comprehensive mapping of crops to their measurement units
export const CROP_UNITS: Record<string, CropUnitMapping> = {
  // Grains and Cereals
  "Maize": {
    primary: "kg",
    alternatives: ["bag", "ton", "crate"],
    description: "Typically sold by weight (kg) or in bags"
  },
  "Rice": {
    primary: "kg",
    alternatives: ["bag", "ton", "crate"],
    description: "Typically sold by weight (kg) or in bags"
  },
  "Millet": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },
  "Sorghum": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },
  "Wheat": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },

  // Root Crops
  "Cassava": {
    primary: "kg",
    alternatives: ["bag", "tuber", "bundle"],
    description: "Can be sold by weight or individual tubers"
  },
  "Yam": {
    primary: "tuber",
    alternatives: ["kg", "bag", "bundle"],
    description: "Typically sold per tuber or by weight"
  },
  "Sweet Potato": {
    primary: "kg",
    alternatives: ["bag", "tuber", "bundle"],
    description: "Can be sold by weight or individual pieces"
  },
  "Potato": {
    primary: "kg",
    alternatives: ["bag", "piece", "crate"],
    description: "Typically sold by weight or in bags"
  },
  "Cocoyam": {
    primary: "kg",
    alternatives: ["bag", "tuber", "bundle"],
    description: "Can be sold by weight or individual tubers"
  },

  // Fruits
  "Plantain": {
    primary: "bunch",
    alternatives: ["kg", "finger", "hand"],
    description: "Typically sold by bunch, but can be by weight"
  },
  "Banana": {
    primary: "bunch",
    alternatives: ["kg", "finger", "hand"],
    description: "Typically sold by bunch or by weight"
  },
  "Orange": {
    primary: "kg",
    alternatives: ["piece", "bag", "crate", "dozen"],
    description: "Can be sold by weight or count"
  },
  "Mango": {
    primary: "kg",
    alternatives: ["piece", "bag", "crate", "dozen"],
    description: "Can be sold by weight or count"
  },
  "Pineapple": {
    primary: "piece",
    alternatives: ["kg", "dozen", "crate"],
    description: "Typically sold per piece or by weight"
  },
  "Pawpaw": {
    primary: "piece",
    alternatives: ["kg", "dozen"],
    description: "Typically sold per piece or by weight"
  },
  "Watermelon": {
    primary: "piece",
    alternatives: ["kg"],
    description: "Typically sold per piece or by weight"
  },

  // Vegetables
  "Tomatoes": {
    primary: "kg",
    alternatives: ["crate", "box", "basket", "dozen"],
    description: "Typically sold by weight or in crates"
  },
  "Onions": {
    primary: "kg",
    alternatives: ["bag", "bundle", "dozen"],
    description: "Typically sold by weight or in bags"
  },
  "Peppers": {
    primary: "kg",
    alternatives: ["bag", "basket", "dozen"],
    description: "Typically sold by weight"
  },
  "Okra": {
    primary: "kg",
    alternatives: ["bag", "basket", "bundle"],
    description: "Typically sold by weight"
  },
  "Garden Eggs": {
    primary: "kg",
    alternatives: ["bag", "basket", "dozen"],
    description: "Typically sold by weight"
  },
  "Cabbage": {
    primary: "piece",
    alternatives: ["kg", "head"],
    description: "Typically sold per head or by weight"
  },
  "Lettuce": {
    primary: "piece",
    alternatives: ["kg", "head", "bundle"],
    description: "Typically sold per head or by weight"
  },
  "Carrot": {
    primary: "kg",
    alternatives: ["bag", "bundle", "dozen"],
    description: "Typically sold by weight"
  },
  "Cucumber": {
    primary: "kg",
    alternatives: ["piece", "dozen"],
    description: "Can be sold by weight or count"
  },

  // Legumes and Pulses
  "Beans": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },
  "Groundnut": {
    primary: "kg",
    alternatives: ["bag", "basket"],
    description: "Typically sold by weight"
  },
  "Cowpea": {
    primary: "kg",
    alternatives: ["bag", "basket"],
    description: "Typically sold by weight"
  },
  "Soybean": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },

  // Cash Crops
  "Cocoa": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },
  "Coffee": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },
  "Palm Oil": {
    primary: "liter",
    alternatives: ["kg", "gallon", "bottle", "jerrycan"],
    description: "Liquid product sold by volume"
  },
  "Shea Butter": {
    primary: "kg",
    alternatives: ["liter", "bottle", "bag"],
    description: "Can be sold by weight or volume"
  },
  "Cashew": {
    primary: "kg",
    alternatives: ["bag", "ton"],
    description: "Typically sold by weight"
  },

  // Spices and Herbs
  "Ginger": {
    primary: "kg",
    alternatives: ["bag", "bundle"],
    description: "Typically sold by weight"
  },
  "Garlic": {
    primary: "kg",
    alternatives: ["bag", "bundle", "dozen"],
    description: "Typically sold by weight"
  },
  "Turmeric": {
    primary: "kg",
    alternatives: ["bag", "bundle"],
    description: "Typically sold by weight"
  },

  // Other
  "Coconut": {
    primary: "piece",
    alternatives: ["dozen", "bag"],
    description: "Typically sold per piece or by count"
  },
  "Sugar Cane": {
    primary: "piece",
    alternatives: ["bundle", "kg"],
    description: "Typically sold per piece or bundle"
  }
};

/**
 * Get available units for a specific crop
 * @param cropName - Name of the crop
 * @returns Array of available units (primary first, then alternatives)
 */
export function getUnitsForCrop(cropName: string): string[] {
  const crop = CROP_UNITS[cropName];
  if (crop) {
    return [crop.primary, ...crop.alternatives];
  }
  // Default units if crop not found
  return ["kg", "bag", "crate", "box", "ton", "piece", "dozen", "bundle"];
}

/**
 * Get primary unit for a specific crop
 * @param cropName - Name of the crop
 * @returns Primary unit for the crop, or "kg" as default
 */
export function getPrimaryUnitForCrop(cropName: string): string {
  const crop = CROP_UNITS[cropName];
  return crop?.primary || "kg";
}

/**
 * Get all unique units across all crops
 * @returns Array of all unique unit names
 */
export function getAllUnits(): string[] {
  const unitsSet = new Set<string>();
  
  Object.values(CROP_UNITS).forEach(crop => {
    unitsSet.add(crop.primary);
    crop.alternatives.forEach(unit => unitsSet.add(unit));
  });
  
  return Array.from(unitsSet).sort();
}

/**
 * Get all crop names
 * @returns Array of all crop names
 */
export function getAllCropNames(): string[] {
  return Object.keys(CROP_UNITS).sort();
}

/**
 * Check if a unit is valid for a specific crop
 * @param cropName - Name of the crop
 * @param unit - Unit to check
 * @returns True if the unit is valid for the crop
 */
export function isValidUnitForCrop(cropName: string, unit: string): boolean {
  const crop = CROP_UNITS[cropName];
  if (!crop) return true; // If crop not found, allow any unit
  return crop.primary === unit || crop.alternatives.includes(unit);
}

