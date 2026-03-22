export interface ServiceProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  category: "pet-day-care" | "pet-boarding" | "grooming" | "teeth-cleaning"
  petSize?: "small" | "large" | "any"
  isAddOn?: boolean
  daycareType?: "assessment" | "half-day" | "full-day" | "extended-day" | "express-play"
  maxHours?: number
  requiresAssessment?: boolean
}

// Daycare service configuration
export const DAYCARE_CONFIG = {
  "assessment": { maxHours: 8, label: "Assessment Day", requiresAssessment: false },
  "half-day": { maxHours: 5, label: "Half Day", requiresAssessment: true },
  "full-day": { maxHours: 9, label: "Full Day", requiresAssessment: true },
  "extended-day": { maxHours: 12, label: "Extended Day", requiresAssessment: true },
  "express-play": { maxHours: 2, label: "Express Play", minHour: 6, maxHour: 18, requiresAssessment: true },
}

// Pricing by size for daycare services
export const DAYCARE_PRICING = {
  "half-day": { small: 3400, large: 3800 },
  "full-day": { small: 4000, large: 4400 },
  "extended-day": { small: 4400, large: 4900 },
  "express-play": { small: 2500, large: 2500 }, // Flat rate
  "assessment": { small: 8900, large: 8900 }, // Flat rate
}

// Additional dog pricing
export const ADDITIONAL_DOG_PRICING = {
  "half-day": { small: 2400, large: 2800 },
  "full-day": { small: 3000, large: 3400 },
  "extended-day": { small: 3400, large: 3900 },
  "express-play": { small: 1500, large: 1500 },
}

export const SERVICES: ServiceProduct[] = [
  // Pet Day Care - These are now handled dynamically with size selection
  {
    id: "daycare-assessment",
    name: "Assessment Day",
    description: "Required prior to daycare or overnight stay",
    priceInCents: 8900,
    category: "pet-day-care",
    petSize: "any",
    daycareType: "assessment",
    maxHours: 8,
    requiresAssessment: false,
  },
  {
    id: "daycare-half-day",
    name: "Half Day",
    description: "Sessions up to 5 hours",
    priceInCents: 3400, // Base price (small), updated dynamically
    category: "pet-day-care",
    petSize: "any",
    daycareType: "half-day",
    maxHours: 5,
    requiresAssessment: true,
  },
  {
    id: "daycare-full-day",
    name: "Full Day",
    description: "Sessions up to 9 hours",
    priceInCents: 4000, // Base price (small), updated dynamically
    category: "pet-day-care",
    petSize: "any",
    daycareType: "full-day",
    maxHours: 9,
    requiresAssessment: true,
  },
  {
    id: "daycare-extended-day",
    name: "Extended Day",
    description: "Sessions up to 12 hours",
    priceInCents: 4400, // Base price (small), updated dynamically
    category: "pet-day-care",
    petSize: "any",
    daycareType: "extended-day",
    maxHours: 12,
    requiresAssessment: true,
  },
  {
    id: "daycare-express-play",
    name: "Express Play",
    description: "Max 2 hours, available 6am-6pm only",
    priceInCents: 2500, // Flat rate
    category: "pet-day-care",
    petSize: "any",
    daycareType: "express-play",
    maxHours: 2,
    requiresAssessment: true,
  },
  
  // Pet Boarding
  {
    id: "boarding-assessment",
    name: "Assessment Day",
    description: "Required prior to daycare or overnight stay",
    priceInCents: 8900,
    category: "pet-boarding",
    petSize: "any",
  },
  {
    id: "boarding-1-7-nights-small",
    name: "1–7 Nights (Small Pet)",
    description: "Daycare included in overnight stay",
    priceInCents: 7900,
    category: "pet-boarding",
    petSize: "small",
  },
  {
    id: "boarding-1-7-nights-large",
    name: "1–7 Nights (Large Pet)",
    description: "Daycare included in overnight stay",
    priceInCents: 8500,
    category: "pet-boarding",
    petSize: "large",
  },
  {
    id: "boarding-1-7-additional-small",
    name: "1–7 Nights Each Additional Pup (Small)",
    description: "Multiple dogs must share quarters for multi-dog pricing",
    priceInCents: 6900,
    category: "pet-boarding",
    petSize: "small",
  },
  {
    id: "boarding-1-7-additional-large",
    name: "1–7 Nights Each Additional Pup (Large)",
    description: "Multiple dogs must share quarters for multi-dog pricing",
    priceInCents: 7500,
    category: "pet-boarding",
    petSize: "large",
  },
  {
    id: "boarding-8plus-nights-small",
    name: "8+ Nights (Small Pet)",
    description: "Daycare included in overnight stay",
    priceInCents: 7400,
    category: "pet-boarding",
    petSize: "small",
  },
  {
    id: "boarding-8plus-nights-large",
    name: "8+ Nights (Large Pet)",
    description: "Daycare included in overnight stay",
    priceInCents: 8000,
    category: "pet-boarding",
    petSize: "large",
  },
  {
    id: "boarding-8plus-additional-small",
    name: "8+ Nights Each Additional Pup (Small)",
    description: "Multiple dogs must share quarters for multi-dog discount",
    priceInCents: 6400,
    category: "pet-boarding",
    petSize: "small",
  },
  {
    id: "boarding-8plus-additional-large",
    name: "8+ Nights Each Additional Pup (Large)",
    description: "Multiple dogs must share quarters for multi-dog discount",
    priceInCents: 7000,
    category: "pet-boarding",
    petSize: "large",
  },
  
  // Grooming - Full Groom
  {
    id: "grooming-full-toy",
    name: "Full Groom (Toy/X-Small)",
    description: "Haircut, bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 6000,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-full-small",
    name: "Full Groom (Small)",
    description: "Haircut, bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 8000,
    category: "grooming",
    petSize: "small",
  },
  {
    id: "grooming-full-medium",
    name: "Full Groom (Medium)",
    description: "Haircut, bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 10000,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-full-large",
    name: "Full Groom (Large)",
    description: "Haircut, bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 12000,
    category: "grooming",
    petSize: "large",
  },
  {
    id: "grooming-full-xlarge",
    name: "Full Groom (X-Large)",
    description: "Haircut, bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 14000,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-poodle-paws",
    name: "Shaved Poodle Paws Add-On",
    description: "Add-on for poodle paw shaving",
    priceInCents: 2500,
    category: "grooming",
    petSize: "any",
    isAddOn: true,
  },
  
  // Grooming - Bath Only
  {
    id: "grooming-bath-toy",
    name: "Bath Only (Toy/X-Small)",
    description: "Bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 4000,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-bath-small",
    name: "Bath Only (Small)",
    description: "Bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 6500,
    category: "grooming",
    petSize: "small",
  },
  {
    id: "grooming-bath-medium",
    name: "Bath Only (Medium)",
    description: "Bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 8000,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-bath-large",
    name: "Bath Only (Large)",
    description: "Bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 10000,
    category: "grooming",
    petSize: "large",
  },
  {
    id: "grooming-bath-xlarge",
    name: "Bath Only (X-Large)",
    description: "Bath, blow dry, brush out, nail trim. BONUS: Ear & Teeth clean",
    priceInCents: 12000,
    category: "grooming",
    petSize: "any",
  },
  
  // Grooming - Walk-In Services
  {
    id: "grooming-walkin-nails",
    name: "Walk-In: Nails",
    description: "Individual nail trimming service",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-walkin-teeth",
    name: "Walk-In: Teeth Brushing",
    description: "Individual teeth brushing service",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-walkin-ears",
    name: "Walk-In: Ear Cleaning",
    description: "Individual ear cleaning service",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-walkin-gland",
    name: "Walk-In: Gland Care",
    description: "Individual gland care service",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-trim-sanitary",
    name: "Sanitary Trim",
    description: "Pet must be clean",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-trim-pawpad",
    name: "Paw Pad Trim",
    description: "Pet must be clean",
    priceInCents: 1500,
    category: "grooming",
    petSize: "any",
  },
  {
    id: "grooming-trim-face",
    name: "Face Trim",
    description: "Pet must be clean",
    priceInCents: 2500,
    category: "grooming",
    petSize: "any",
  },
  
  // Grooming - Add-Ons
  {
    id: "grooming-addon-hypoallergenic",
    name: "Hypoallergenic Shampoo",
    description: "Hypoallergenic shampoo add-on",
    priceInCents: 500,
    category: "grooming",
    petSize: "any",
    isAddOn: true,
  },
  {
    id: "grooming-addon-medicated",
    name: "Medicated Shampoo",
    description: "Medicated shampoo add-on",
    priceInCents: 500,
    category: "grooming",
    petSize: "any",
    isAddOn: true,
  },
  {
    id: "grooming-addon-deshedding",
    name: "Deshedding Treatment",
    description: "Per 10 minute session",
    priceInCents: 1000,
    category: "grooming",
    petSize: "any",
    isAddOn: true,
  },
  {
    id: "grooming-addon-deskunk",
    name: "Deskunk Treatment",
    description: "Remove skunk odor",
    priceInCents: 4000,
    category: "grooming",
    petSize: "any",
    isAddOn: true,
  },
  
  // Teeth Cleaning
  {
    id: "teeth-basic",
    name: "Basic Teeth Cleaning",
    description: "Surface cleaning with natural products",
    priceInCents: 4500,
    category: "teeth-cleaning",
    petSize: "any",
  },
  {
    id: "teeth-deep",
    name: "Deep Cleaning Treatment",
    description: "Thorough plaque and tartar removal",
    priceInCents: 7500,
    category: "teeth-cleaning",
    petSize: "any",
  },
  {
    id: "teeth-breath",
    name: "Breath Freshening",
    description: "Natural breath freshening treatment",
    priceInCents: 2500,
    category: "teeth-cleaning",
    petSize: "any",
  },
  {
    id: "teeth-assessment",
    name: "Dental Health Assessment",
    description: "Complete oral health evaluation",
    priceInCents: 3500,
    category: "teeth-cleaning",
    petSize: "any",
  },
]

export function getServicesByCategory(category: string) {
  return SERVICES.filter((service) => service.category === category && !service.isAddOn)
}

export function getAddOns() {
  return SERVICES.filter((service) => service.isAddOn)
}

export function getMainServices() {
  return SERVICES.filter((service) => !service.isAddOn)
}

export function formatPrice(priceInCents: number) {
  return `$${(priceInCents / 100).toFixed(2)}`
}
