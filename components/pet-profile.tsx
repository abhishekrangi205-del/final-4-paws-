"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dog, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  FileText, 
  Calendar, 
  Shield, 
  X,
  Check,
  Loader2,
  Camera,
  AlertCircle
} from "lucide-react"

type VaccinationRecord = {
  id: string
  vaccine_name: string
  date_administered: string
  expiration_date: string | null
  document_url: string | null
  document_pathname: string | null
  notes: string | null
  verified: boolean
  created_at: string
}

type Pet = {
  id: string
  name: string
  breed: string | null
  age_years: number | null
  age_months: number | null
  weight_lbs: number | null
  size: "small" | "large" | null
  gender: "male" | "female" | null
  spayed_neutered: boolean
  medical_notes: string | null
  special_instructions: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  vet_name: string | null
  vet_phone: string | null
  profile_image_url: string | null
  vaccination_records: VaccinationRecord[]
}

const commonVaccines = [
  "Rabies",
  "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
  "Bordetella (Kennel Cough)",
  "Canine Influenza",
  "Leptospirosis",
  "Lyme Disease",
]

export function PetProfileManager() {
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPet, setShowAddPet] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [showAddVaccine, setShowAddVaccine] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fetchPets = useCallback(async () => {
    try {
      const res = await fetch("/api/pets")
      if (res.ok) {
        const data = await res.json()
        setPets(data)
      }
    } catch (err) {
      setError("Failed to load pets")
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Fetch pets on mount
  useEffect(() => {
    fetchPets()
  }, [fetchPets])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {/* Pet Cards */}
      {pets.length === 0 && !showAddPet ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <Dog className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No pets added yet</p>
          <Button onClick={() => setShowAddPet(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Pet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {pets.map(pet => (
            <PetCard 
              key={pet.id} 
              pet={pet} 
              onEdit={() => setEditingPet(pet)}
              onDelete={async () => {
                if (confirm(`Delete ${pet.name}?`)) {
                  await fetch(`/api/pets/${pet.id}`, { method: "DELETE" })
                  fetchPets()
                }
              }}
              onAddVaccine={() => setShowAddVaccine(pet.id)}
              onRefresh={fetchPets}
            />
          ))}
          
          {!showAddPet && (
            <Button onClick={() => setShowAddPet(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Pet
            </Button>
          )}
        </div>
      )}
      
      {/* Add Pet Form */}
      {showAddPet && (
        <PetForm 
          onSave={async (data) => {
            const res = await fetch("/api/pets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            })
            if (res.ok) {
              setShowAddPet(false)
              fetchPets()
            }
          }}
          onCancel={() => setShowAddPet(false)}
        />
      )}
      
      {/* Edit Pet Form */}
      {editingPet && (
        <PetForm 
          pet={editingPet}
          onSave={async (data) => {
            const res = await fetch(`/api/pets/${editingPet.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            })
            if (res.ok) {
              setEditingPet(null)
              fetchPets()
            }
          }}
          onCancel={() => setEditingPet(null)}
        />
      )}
      
      {/* Add Vaccine Modal */}
      {showAddVaccine && (
        <VaccinationForm
          petId={showAddVaccine}
          onSave={() => {
            setShowAddVaccine(null)
            fetchPets()
          }}
          onCancel={() => setShowAddVaccine(null)}
        />
      )}
    </div>
  )
}

function PetCard({ 
  pet, 
  onEdit, 
  onDelete, 
  onAddVaccine,
  onRefresh 
}: { 
  pet: Pet
  onEdit: () => void
  onDelete: () => void
  onAddVaccine: () => void
  onRefresh: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  
  const handleDeleteVaccine = async (vaccinationId: string) => {
    if (confirm("Delete this vaccination record?")) {
      await fetch(`/api/pets/${pet.id}/vaccinations?vaccinationId=${vaccinationId}`, {
        method: "DELETE",
      })
      onRefresh()
    }
  }
  
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {pet.profile_image_url ? (
            <img 
              src={`/api/file?pathname=${encodeURIComponent(pet.profile_image_url)}`}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Dog className="w-8 h-8 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{pet.name}</h3>
              <p className="text-sm text-muted-foreground">
                {pet.breed || "Unknown breed"}
                {pet.age_years !== null && ` • ${pet.age_years}y${pet.age_months ? ` ${pet.age_months}m` : ""}`}
                {pet.weight_lbs && ` • ${pet.weight_lbs} lbs`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {pet.size && (
              <span className="px-2 py-0.5 bg-secondary rounded-full text-xs capitalize">
                {pet.size}
              </span>
            )}
            {pet.gender && (
              <span className="px-2 py-0.5 bg-secondary rounded-full text-xs capitalize">
                {pet.gender}
              </span>
            )}
            {pet.spayed_neutered && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                {pet.gender === "female" ? "Spayed" : "Neutered"}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Expand/Collapse */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
      >
        {expanded ? "Hide Details" : "Show Details & Vaccinations"}
        <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
      </button>
      
      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Pet Details */}
          {(pet.medical_notes || pet.special_instructions || pet.vet_name || pet.emergency_contact_name) && (
            <div className="space-y-2 text-sm">
              {pet.medical_notes && (
                <div>
                  <span className="font-medium text-foreground">Medical Notes:</span>
                  <p className="text-muted-foreground">{pet.medical_notes}</p>
                </div>
              )}
              {pet.special_instructions && (
                <div>
                  <span className="font-medium text-foreground">Special Instructions:</span>
                  <p className="text-muted-foreground">{pet.special_instructions}</p>
                </div>
              )}
              {pet.vet_name && (
                <div>
                  <span className="font-medium text-foreground">Vet:</span>
                  <span className="text-muted-foreground ml-1">{pet.vet_name} {pet.vet_phone && `(${pet.vet_phone})`}</span>
                </div>
              )}
              {pet.emergency_contact_name && (
                <div>
                  <span className="font-medium text-foreground">Emergency Contact:</span>
                  <span className="text-muted-foreground ml-1">{pet.emergency_contact_name} {pet.emergency_contact_phone && `(${pet.emergency_contact_phone})`}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Vaccination Records */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Vaccination Records
              </h4>
              <Button size="sm" variant="outline" onClick={onAddVaccine}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {pet.vaccination_records?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-lg">
                No vaccination records yet
              </p>
            ) : (
              <div className="space-y-2">
                {pet.vaccination_records?.map(vax => (
                  <div 
                    key={vax.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{vax.vaccine_name}</span>
                        {vax.verified && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Given: {new Date(vax.date_administered).toLocaleDateString()}
                        {vax.expiration_date && ` • Expires: ${new Date(vax.expiration_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {vax.document_pathname && (
                        <a 
                          href={`/api/file?pathname=${encodeURIComponent(vax.document_pathname)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-secondary rounded"
                        >
                          <FileText className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteVaccine(vax.id)}
                        className="p-1.5 hover:bg-secondary rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PetForm({ 
  pet, 
  onSave, 
  onCancel 
}: { 
  pet?: Pet
  onSave: (data: Partial<Pet>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: pet?.name || "",
    breed: pet?.breed || "",
    age_years: pet?.age_years?.toString() || "",
    age_months: pet?.age_months?.toString() || "",
    weight_lbs: pet?.weight_lbs?.toString() || "",
    size: pet?.size || "",
    gender: pet?.gender || "",
    spayed_neutered: pet?.spayed_neutered || false,
    medical_notes: pet?.medical_notes || "",
    special_instructions: pet?.special_instructions || "",
    emergency_contact_name: pet?.emergency_contact_name || "",
    emergency_contact_phone: pet?.emergency_contact_phone || "",
    vet_name: pet?.vet_name || "",
    vet_phone: pet?.vet_phone || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(pet?.profile_image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "profile")
      if (pet?.id) formData.append("petId", pet.id)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
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
    
    await onSave({
      name: formData.name,
      breed: formData.breed || null,
      age_years: formData.age_years ? parseInt(formData.age_years) : null,
      age_months: formData.age_months ? parseInt(formData.age_months) : null,
      weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
      size: (formData.size as "small" | "large") || null,
      gender: (formData.gender as "male" | "female") || null,
      spayed_neutered: formData.spayed_neutered,
      medical_notes: formData.medical_notes || null,
      special_instructions: formData.special_instructions || null,
      emergency_contact_name: formData.emergency_contact_name || null,
      emergency_contact_phone: formData.emergency_contact_phone || null,
      vet_name: formData.vet_name || null,
      vet_phone: formData.vet_phone || null,
      profile_image_url: profileImage,
    })
    
    setIsSubmitting(false)
  }
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">{pet ? "Edit Pet" : "Add New Pet"}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
          <div className="grid grid-cols-2 gap-3">
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
          <div className="space-y-3">
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
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
            <div className="grid grid-cols-2 gap-3">
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
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {pet ? "Save Changes" : "Add Pet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VaccinationForm({ 
  petId,
  onSave, 
  onCancel 
}: { 
  petId: string
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    vaccine_name: "",
    date_administered: "",
    expiration_date: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentUploading, setDocumentUploading] = useState(false)
  const [documentPathname, setDocumentPathname] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setDocumentUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "vaccination")
      formData.append("petId", petId)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const { pathname } = await res.json()
        setDocumentPathname(pathname)
      }
    } catch (err) {
      console.error("Upload failed:", err)
    } finally {
      setDocumentUploading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const res = await fetch(`/api/pets/${petId}/vaccinations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vaccine_name: formData.vaccine_name,
        date_administered: formData.date_administered,
        expiration_date: formData.expiration_date || null,
        notes: formData.notes || null,
        document_pathname: documentPathname,
      }),
    })
    
    if (res.ok) {
      onSave()
    }
    setIsSubmitting(false)
  }
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Add Vaccination Record
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vaccine Name *</label>
            <select
              required
              value={formData.vaccine_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vaccine_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">Select vaccine...</option>
              {commonVaccines.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
              <option value="other">Other</option>
            </select>
            {formData.vaccine_name === "other" && (
              <Input
                className="mt-2"
                placeholder="Enter vaccine name"
                onChange={(e) => setFormData(prev => ({ ...prev, vaccine_name: e.target.value }))}
              />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date Given *</label>
              <Input
                type="date"
                required
                value={formData.date_administered}
                onChange={(e) => setFormData(prev => ({ ...prev, date_administered: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiration Date</label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>
          
          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Upload Record (PDF or Image)</label>
            {documentPathname ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 flex-1">Document uploaded</span>
                <button 
                  type="button" 
                  onClick={() => setDocumentPathname(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={documentUploading}
                className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2"
              >
                {documentUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleDocumentUpload}
              className="hidden"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
