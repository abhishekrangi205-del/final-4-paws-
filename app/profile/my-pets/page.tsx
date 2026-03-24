"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, FileText, Calendar, AlertCircle, Loader2, Syringe, Trash2 } from "lucide-react"
import Link from "next/link"

type Vaccination = {
  id: string
  pathname: string
  url: string
  fileName: string
  petId: string
  uploadedAt: string
  size: number
}

type Pet = {
  id: string
  name: string
  breed?: string
  gender?: string
  age_years?: number
  age_months?: number
  weight_lbs?: number
  spayed_neutered?: boolean
  profile_image_url?: string
  vaccinations?: Vaccination[]
  created_at: string
}

export default function MyPetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPetId, setExpandedPetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch("/api/pets/details")
        if (response.ok) {
          const data = await response.json()
          const petsArray = Array.isArray(data) ? data : []
          
          // Fetch vaccinations from Blob storage for each pet
          const petsWithVaccinations = await Promise.all(
            petsArray.map(async (pet) => {
              try {
                const vaccResponse = await fetch(`/api/vaccinations/list?petId=${pet.id}`)
                if (vaccResponse.ok) {
                  const vaccinations = await vaccResponse.json()
                  return { ...pet, vaccinations: Array.isArray(vaccinations) ? vaccinations : [] }
                } else {
                  // If the API returns an error (like Blob token not configured), just skip vaccinations
                  return { ...pet, vaccinations: [] }
                }
              } catch (err) {
                // Silently fail and return pet without vaccinations
                console.error(`Failed to fetch vaccinations for pet ${pet.id}:`, err)
                return { ...pet, vaccinations: [] }
              }
            })
          )
          
          setPets(petsWithVaccinations)
        }
      } catch (err) {
        console.error("Failed to fetch pets:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPets()
  }, [])

  const handleDeletePet = async (petId: string, petName: string) => {
    if (confirm(`Delete ${petName}?`)) {
      try {
        const res = await fetch(`/api/pets/${petId}`, { method: "DELETE" })
        if (res.ok) {
          setPets(pets.filter(p => p.id !== petId))
          setError(null)
        } else {
          const errorData = await res.json()
          setError(errorData.error || "Failed to delete pet")
        }
      } catch (err) {
        setError("Failed to delete pet. Please try again.")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your pets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Pets</h1>
              <p className="text-muted-foreground">View your pets and their vaccination records</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/add-pet">
              <Plus className="w-4 h-4 mr-2" />
              Add New Pet
            </Link>
          </Button>
        </div>

        {/* Pets List */}
        {pets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <AlertCircle className="w-12 h-12 mx-auto opacity-50" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">No pets yet</p>
              <p className="text-muted-foreground mb-4">Add your first pet to get started</p>
              <Button asChild>
                <Link href="/add-pet">Add Pet</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
            {pets.map((pet) => (
              <Card key={pet.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setExpandedPetId(expandedPetId === pet.id ? null : pet.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                        {pet.breed && (
                          <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {pet.breed}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        {pet.gender && <span>Gender: {pet.gender}</span>}
                        {pet.age_years !== undefined && (
                          <span>
                            Age: {pet.age_years}
                            {pet.age_months ? ` years ${pet.age_months} months` : " years"}
                          </span>
                        )}
                        {pet.weight_lbs && <span>Weight: {pet.weight_lbs} lbs</span>}
                        {pet.spayed_neutered && <span>Spayed/Neutered</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePet(pet.id, pet.name)
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {pet.vaccinations && pet.vaccinations.length > 0 ? (
                            <>
                              <p className="font-medium text-foreground">{pet.vaccinations.length}</p>
                              <p>Vaccination{pet.vaccinations.length !== 1 ? "s" : ""}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-foreground">0</p>
                              <p>Vaccinations</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                {expandedPetId === pet.id && (
                  <CardContent className="border-t border-border pt-6 space-y-6">
                    {/* Pet Details */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Pet Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pet.breed && (
                          <div>
                            <p className="text-sm text-muted-foreground">Breed</p>
                            <p className="font-medium text-foreground">{pet.breed}</p>
                          </div>
                        )}
                        {pet.gender && (
                          <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-medium text-foreground">{pet.gender}</p>
                          </div>
                        )}
                        {pet.age_years !== undefined && (
                          <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium text-foreground">
                              {pet.age_years} years {pet.age_months || 0} months
                            </p>
                          </div>
                        )}
                        {pet.weight_lbs && (
                          <div>
                            <p className="text-sm text-muted-foreground">Weight</p>
                            <p className="font-medium text-foreground">{pet.weight_lbs} lbs</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vaccinations */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Syringe className="w-4 h-4" />
                          Vaccination Records
                        </h4>
                        <Button size="sm" asChild>
                          <Link href="/profile/vaccines">
                            <Plus className="w-3 h-3 mr-1" />
                            Add Vaccine
                          </Link>
                        </Button>
                      </div>

                      {pet.vaccinations && pet.vaccinations.length > 0 ? (
                        <div className="space-y-3">
                          {pet.vaccinations.map((vaccine) => (
                            <div
                              key={vaccine.id}
                              className="p-4 rounded-lg border bg-secondary/50 border-border"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium text-foreground">{vaccine.fileName}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Uploaded: {new Date(vaccine.uploadedAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Size: {(vaccine.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <a
                                  href={vaccine.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors"
                                >
                                  View
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border border-dashed border-border bg-secondary/30">
                          <p className="text-sm text-muted-foreground text-center">No vaccination records yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
