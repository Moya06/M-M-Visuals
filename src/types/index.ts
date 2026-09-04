export interface ImageData {
  src: string
  title?: string | null
  description?: string | null
  categoryName?: string | null
  thumbnailSrc?: string | null
  width?: number | null
  height?: number | null
  date?: string | null
}

// ── Tipos de Supabase ─────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  created_at: string
}

export interface Photo {
  id: string
  title: string | null
  description: string | null
  category_id: string | null
  category?: Category | null
  storage_key: string
  thumbnail_key: string | null
  url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  created_at: string
}

// ── Formulario de subida ──────────────────────────────────────────────────────
export interface UploadFormValues {
  file: File
  title: string
  description: string
  category_id: string
}
