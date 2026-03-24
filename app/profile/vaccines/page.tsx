"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, FileText, Image, Loader2, Check, X, Trash2, Calendar } from "lucide-react"
import Link from "next/link"

type Pet = {
  id: string
  name: string
}

type UploadedVaccination = {
  id: string
  petName: string
  vaccineName: string
  vaccinationDate: string
  fileName: string
  uploadedAt: Date
  url: string
  pathname: string
}

export default function VaccinesPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState("")
  const [vaccineName, setVaccineName] = useState("")
  const [vaccinationDate, setVaccinationDate] = useState("")
  const [notes, setNotes] = useState("")
  const [vaccinations, setVaccinations] = useState<UploadedVaccination[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    "image/jpeg",
    "image/png", 
    "image/webp",
    "application/pdf"
  ]
  const maxSize = 10 * 1024 * 1024 // 10MB

  // Fetch pets on mount
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch("/api/pets")
        if (response.ok) {
          const data = await response.json()
          setPets(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error("Failed to fetch pets:", err)
      }
    }
    fetchPets()
  }, [])

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed."
    }
    if (file.size > maxSize) {
      return "File too large. Maximum size is 10MB."
    }
    return null
  }

  const uploadFile = async (file: File) => {
    if (!selectedPetId) {
      setError("Please select a pet first")
      return
    }
    if (!vaccineName) {
      setError("Please enter vaccine name")
      return
    }
    if (!vaccinationDate) {
      setError("Please select vaccination date")
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "vaccination")
      formData.append("petId", selectedPetId)

      setUploadProgress(30)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(70)

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        throw new Error(data.error || "Upload failed")
      }

      const uploadData = await uploadResponse.json()

      // Save vaccination record to database
      const saveResponse = await fetch("/api/vaccinations/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: selectedPetId,
          vaccineName,
          vaccinationDate,
          notes,
          filePathname: uploadData.pathname,
          fileUrl: uploadData.url,
        }),
      })

      if (!saveResponse.ok) {
        const data = await saveResponse.json()
        throw new Error(data.error || "Failed to save vaccination record")
      }

      setUploadProgress(100)

      const petName = pets.find(p => p.id === selectedPetId)?.name || "Unknown"
      const newVaccination: UploadedVaccination = {
        id: Date.now().toString(),
        petName,
        vaccineName,
        vaccinationDate,
        fileName: file.name,
        uploadedAt: new Date(),
        url: uploadData.url,
        pathname: uploadData.pathname,
      }

      setVaccinations(prev => [newVaccination, ...prev])
      
      // Reset form
      setVaccineName("")
      setVaccinationDate("")
      setNotes("")
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    uploadFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeVaccination = (id: string) => {
    setVaccinations(prev => prev.filter(v => v.id !== id))
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />
    }
    return <Image className="w-5 h-5 text-blue-500" />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vaccination Records</h1>
            <p className="text-muted-foreground">Upload and track vaccination documents for your pets</p>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Vaccination Document</CardTitle>
            <CardDescription>
              Add vaccination documents with pet details and date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Pet *
              </label>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                disabled={uploading}
              >
                <option value="">Choose a pet...</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vaccine Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vaccine Name *
              </label>
              <Input
                placeholder="e.g., Rabies, DHPP, COVID-19"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                disabled={uploading}
              />
            </div>

            {/* Vaccination Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vaccination Date *
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={vaccinationDate}
                  onChange={(e) => setVaccinationDate(e.target.value)}
                  disabled={uploading}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                placeholder="e.g., Veterinarian name, batch number, next due date"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg resize-none"
                rows={3}
              />
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-secondary/30"
                }
                ${uploading ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, WEBP, or PDF up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive flex-1">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-destructive/20 rounded"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Vaccinations */}
        {vaccinations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Vaccinations</CardTitle>
              <CardDescription>
                {vaccinations.length} record{vaccinations.length !== 1 ? "s" : ""} saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vaccinations.map(vac => (
                  <div 
                    key={vac.id}
                    className="p-4 bg-secondary/30 rounded-lg border border-border space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(vac.fileName)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">
                            {vac.vaccineName} - {vac.petName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vac.fileName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeVaccination(vac.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pl-8">
                      <span>Date: {new Date(vac.vaccinationDate).toLocaleDateString()}</span>
                      <span>Uploaded: {vac.uploadedAt.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 pl-8">
                      <a
                        href={vac.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Check className="w-4 h-4" />
                        View Document
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

