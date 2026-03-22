export interface ServiceProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  category: "pet-day-care" | "pet-boarding" | "grooming" | "teeth-cleaning"
  petSize?: "small" | "large" | "any"
  isAddOn?: boolean
}

export const SERVICES: ServiceProduct[] = [
  // Pet Day Care
  {
    id: "daycare-assessment",
    name: "Assessment Day",
    description: "Required prior to daycare or overnight stay",
    priceInCents: 8900,
    category: "pet-day-care",
    petSize: "any",
  },
  {
    id: "daycare-half-small",
    name: "Half Day (Small Pet)",
    description: "Sessions up to 5 hours for small pets",
    priceInCents: 3400,
    category: "pet-day-care",
    petSize: "small",
  },
  {
    id: "daycare-half-large",
    name: "Half Day (Large Pet)",
    description: "Sessions up to 5 hours for large pets",
    priceInCents: 3800,
    category: "pet-day-care",
    petSize: "large",
  },
  {
    id: "daycare-full-small",
    name: "Full Day (Small Pet)",
    description: "Sessions up to 9 hours for small pets",
    priceInCents: 4000,
    category: "pet-day-care",
    petSize: "small",
  },
  {
    id: "daycare-full-large",
    name: "Full Day (Large Pet)",
    description: "Sessions up to 9 hours for large pets",
    priceInCents: 4400,
    category: "pet-day-care",
    petSize: "large",
  },
  {
    id: "daycare-extended-small",
    name: "Extended Day (Small Pet)",
    description: "Sessions up to 12 hours for small pets",
    priceInCents: 4400,
    category: "pet-day-care",
    petSize: "small",
  },
  {
    id: "daycare-extended-large",
    name: "Extended Day (Large Pet)",
    description: "Sessions up to 12 hours for large pets",
    priceInCents: 4900,
    category: "pet-day-care",
    petSize: "large",
  },
  {
    id: "daycare-express",
    name: "Express Play",
    description: "Max 2 hours, any day 6am-6pm",
    priceInCents: 2500,
    category: "pet-day-care",
    petSize: "any",
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
