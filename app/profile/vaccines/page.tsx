"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, FileText, Image, Loader2, Check, X, Trash2 } from "lucide-react"
import Link from "next/link"

type UploadedFile = {
  id: string
  name: string
  url: string
  pathname: string
  contentType: string
  uploadedAt: Date
}

export default function VaccinesPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
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
    setUploading(true)
    setError(null)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "vaccination")

      setUploadProgress(30)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await response.json()
      setUploadProgress(100)

      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url: data.url,
        pathname: data.pathname,
        contentType: data.contentType,
        uploadedAt: new Date(),
      }

      setFiles(prev => [newFile, ...prev])
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

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getFileIcon = (contentType: string) => {
    if (contentType === "application/pdf") {
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
            <p className="text-muted-foreground">Upload vaccination documents for your pets</p>
          </div>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Vaccination Document</CardTitle>
            <CardDescription>
              Supported formats: JPG, PNG, WEBP, PDF (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto p-1 hover:bg-destructive/20 rounded"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                {files.length} file{files.length !== 1 ? "s" : ""} uploaded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map(file => (
                  <div 
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    {getFileIcon(file.contentType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </a>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Copy URL Section */}
              {files.length > 0 && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Latest Upload URL:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      readOnly 
                      value={files[0].url} 
                      className="text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(files[0].url)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
