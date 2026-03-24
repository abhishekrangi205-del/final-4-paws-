"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dog, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Camera,
  Loader2,
  Shield,
  X,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

type VaccinationInput = {
  vaccine_name: string
  date_administered: string
  expiration_date?: string
  notes?: string
}

const commonVaccines = [
  "Rabies",
  "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
  "Bordetella (Kennel Cough)",
  "Canine Influenza",
  "Leptospirosis",
  "Lyme Disease",
]

export default function AddPetPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age_years: "",
    age_months: "",
    weight_lbs: "",
    size: "",
    gender: "",
    spayed_neutered: false,
    medical_notes: "",
    special_instructions: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    vet_name: "",
    vet_phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [vaccinations, setVaccinations] = useState<VaccinationInput[]>([])
  const [showVaxForm, setShowVaxForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user")
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push("/auth/login")
        }
      } catch {
        setIsAuthenticated(false)
        router.push("/auth/login")
      }
    }
    checkAuth()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("type", "profile")
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })
      
      if (res.ok) {
        const { pathname } = await res.json()
        setProfileImage(pathname)
      }
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const petData = {
        name: formData.name,
        breed: formData.breed || null,
        age_years: formData.age_years ? parseInt(formData.age_years) : null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
        size: formData.size || null,
        gender: formData.gender || null,
        spayed_neutered: formData.spayed_neutered,
        medical_notes: formData.medical_notes || null,
        special_instructions: formData.special_instructions || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        vet_name: formData.vet_name || null,
        vet_phone: formData.vet_phone || null,
        profile_image_url: profileImage,
      }

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      })
      
      if (res.ok) {
        const newPet = await res.json()
        
        // Add vaccinations if any were included
        if (vaccinations.length > 0) {
          for (const vax of vaccinations) {
            await fetch(`/api/pets/${newPet.id}/vaccinations`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(vax),
            })
          }
        }
        
        // Redirect to View My Pets page
        router.push("/profile/my-pets")
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Failed to add pet")
      }
    } catch (err) {
      setError("Failed to add pet. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile/my-pets">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Add New Pet</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dog className="w-5 h-5 text-primary" />
              Pet Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={`/api/file?pathname=${encodeURIComponent(profileImage)}`}
                        alt="Pet"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Dog className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Pet's name"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Breed</label>
                  <Input
                    value={formData.breed}
                    onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="e.g., Golden Retriever"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age (Years)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.age_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, age_years: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Age (Months)</label>
                  <Input
                    type="number"
                    min="0"
                    max="11"
                    value={formData.age_months}
                    onChange={(e) => setFormData(prev => ({ ...prev, age_months: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight_lbs}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight_lbs: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    <option value="small">Small (under 30 lbs)</option>
                    <option value="large">Large (30+ lbs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="spayed_neutered"
                    checked={formData.spayed_neutered}
                    onChange={(e) => setFormData(prev => ({ ...prev, spayed_neutered: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <label htmlFor="spayed_neutered" className="text-sm">Spayed/Neutered</label>
                </div>
              </div>
              
              {/* Medical Info */}
              <div className="space-y-4 border-t border-border pt-6">
                <h4 className="font-medium text-sm text-muted-foreground">Medical Information</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Medical Notes</label>
                  <textarea
                    value={formData.medical_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, medical_notes: e.target.value }))}
                    placeholder="Any allergies, conditions, or medications"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                    placeholder="Feeding instructions, behavior notes, etc."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
                  />
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4 border-t border-border pt-6">
                <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Vet Name</label>
                    <Input
                      value={formData.vet_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, vet_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vet Phone</label>
                    <Input
                      value={formData.vet_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, vet_phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Emergency Phone</label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              {/* Vaccination Records */}
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Vaccination Records
                  </h4>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowVaxForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Vaccine
                  </Button>
                </div>
                
                {vaccinations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3 bg-secondary/30 rounded-lg">
                    No vaccination records added yet (optional)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vaccinations.map((vax, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{vax.vaccine_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(vax.date_administered).toLocaleDateString()}
                            {vax.expiration_date && ` - Expires: ${new Date(vax.expiration_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVaccinations(vaccinations.filter((_, i) => i !== idx))}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {showVaxForm && (
                  <VaccinationForm 
                    onAdd={(vax) => {
                      setVaccinations([...vaccinations, vax])
                      setShowVaxForm(false)
                    }}
                    onCancel={() => setShowVaxForm(false)}
                  />
                )}
              </div>
              
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push("/profile/my-pets")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Pet"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function VaccinationForm({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (vax: VaccinationInput) => void
  onCancel: () => void
}) {
  const [vaccineName, setVaccineName] = useState("")
  const [dateAdministered, setDateAdministered] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vaccineName || !dateAdministered) return
    
    onAdd({
      vaccine_name: vaccineName,
      date_administered: dateAdministered,
      expiration_date: expirationDate || undefined,
      notes: notes || undefined,
    })
  }

  return (
    <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-sm">Add Vaccination</h5>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-secondary rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Vaccine Name *</label>
          <select
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">Select a vaccine...</option>
            {commonVaccines.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
            <option value="other">Other</option>
          </select>
          {vaccineName === "other" && (
            <Input
              className="mt-2"
              placeholder="Enter vaccine name"
              onChange={(e) => setVaccineName(e.target.value)}
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Date Administered *</label>
            <Input
              type="date"
              value={dateAdministered}
              onChange={(e) => setDateAdministered(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Expiration Date</label>
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
          />
        </div>
        
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!vaccineName || !dateAdministered}>
            Add Vaccine
          </Button>
        </div>
      </form>
    </div>
  )
}
