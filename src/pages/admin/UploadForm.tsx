import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { v4 as uuidv4 } from 'uuid'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import type { Category, Photo } from '../../types'

interface Props {
  categories: Category[]
  onSuccess: (photo: Photo) => void
}

interface ProgressStep {
  label: string
  done: boolean
}

export function UploadForm({ categories, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [error, setError] = useState<string | null>(null)

  const markStep = (index: number) => {
    setSteps((prev) => prev.map((s, i) => i === index ? { ...s, done: true } : s))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const reset = () => {
    setPreview(null)
    setFileName('')
    setTitle('')
    setDescription('')
    setCategoryId('')
    setProgress(0)
    setSteps([])
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0)
    setSteps([
      { label: 'Comprimiendo imagen optimizada…', done: false },
      { label: 'Generando thumbnail…', done: false },
      { label: 'Subiendo imagen al storage…', done: false },
      { label: 'Subiendo thumbnail…', done: false },
      { label: 'Guardando en base de datos…', done: false },
    ])

    try {
      const id = uuidv4()

      // ── PASO 1: Comprimir imagen optimizada (WebP <1.5 MB, max 2400px) ──
      setProgress(10)
      const optimized = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
      })
      markStep(0)
      setProgress(30)

      // ── PASO 2: Generar thumbnail (WebP <100 KB, max 600px) ──
      const thumbnail = await imageCompression(file, {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 600,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.80,
      })
      markStep(1)
      setProgress(50)

      // Obtener dimensiones de la imagen optimizada
      const img = new Image()
      const imgUrl = URL.createObjectURL(optimized)
      await new Promise<void>((res) => { img.onload = () => res(); img.src = imgUrl })
      URL.revokeObjectURL(imgUrl)
      const { naturalWidth: width, naturalHeight: height } = img

      // ── PASO 3 y 4: Subir o guardar localmente ──
      let url = ''
      let thumbnailUrl = ''
      const optimizedKey = `optimized/${id}.webp`
      const thumbnailKey = `thumbnails/${id}.webp`

      if (isSupabaseConfigured) {
        const { error: uploadErr } = await supabase.storage
          .from('photos')
          .upload(optimizedKey, optimized, { contentType: 'image/webp', cacheControl: '31536000' })

        if (uploadErr) throw new Error(`Error subiendo imagen: ${uploadErr.message}`)
        markStep(2)
        setProgress(70)

        const { error: thumbErr } = await supabase.storage
          .from('photos')
          .upload(thumbnailKey, thumbnail, { contentType: 'image/webp', cacheControl: '31536000' })

        if (thumbErr) throw new Error(`Error subiendo thumbnail: ${thumbErr.message}`)
        markStep(3)
        setProgress(85)

        const { data: optData } = supabase.storage.from('photos').getPublicUrl(optimizedKey)
        const { data: thumbData } = supabase.storage.from('photos').getPublicUrl(thumbnailKey)
        url = optData.publicUrl
        thumbnailUrl = thumbData.publicUrl
      } else {
        // Modo Local/Offline: Convertir a Data URL para previsualizar y almacenar localmente
        const fileToDataUrl = (b: Blob): Promise<string> =>
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(b)
          })

        url = await fileToDataUrl(optimized)
        markStep(2)
        setProgress(70)

        thumbnailUrl = await fileToDataUrl(thumbnail)
        markStep(3)
        setProgress(85)
      }

      // ── PASO 5: Insertar en la base de datos o almacenamiento local ──
      let newPhoto: Photo

      if (isSupabaseConfigured) {
        const { data, error: dbErr } = await supabase
          .from('photos')
          .insert({
            title: title.trim() || null,
            description: description.trim() || null,
            category_id: categoryId || null,
            storage_key: optimizedKey,
            thumbnail_key: thumbnailKey,
            url,
            thumbnail_url: thumbnailUrl,
            width,
            height,
          })
          .select('*, category:categories(id, name, slug, created_at)')
          .single()

        if (dbErr) throw new Error(`Error guardando en DB: ${dbErr.message}`)
        newPhoto = data as Photo
      } else {
        const foundCategory = categories.find((c) => c.id === categoryId) || null
        newPhoto = {
          id,
          title: title.trim() || null,
          description: description.trim() || null,
          category_id: categoryId || null,
          category: foundCategory,
          storage_key: optimizedKey,
          thumbnail_key: thumbnailKey,
          url,
          thumbnail_url: thumbnailUrl,
          width,
          height,
          created_at: new Date().toISOString(),
        }

        const savedPhotos = localStorage.getItem('portfolio_local_photos')
        const currentList: Photo[] = savedPhotos ? JSON.parse(savedPhotos) : []
        localStorage.setItem('portfolio_local_photos', JSON.stringify([newPhoto, ...currentList]))
      }

      markStep(4)
      setProgress(100)

      onSuccess(newPhoto)
      setTimeout(reset, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5 shadow-sm">
      <h2 className="text-lg font-serif text-[var(--text-main)] font-bold">Subir nueva foto</h2>

      {/* Zona de archivo */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-colors group bg-[var(--bg-primary)]/50"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
            <i className="fas fa-cloud-arrow-up text-3xl mb-3 block text-[var(--accent)]" />
            <p className="text-sm font-medium">Haz clic o arrastra una foto aquí</p>
            <p className="text-xs mt-1 opacity-70">JPG, PNG, WEBP — cualquier peso</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          required
        />
      </div>
      {fileName && <p className="text-xs text-[var(--text-muted)]">{fileName}</p>}

      {/* Metadatos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la foto (opcional)"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve (opcional)"
            rows={2}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline de progreso */}
      {uploading && (
        <div className="space-y-2">
          <div className="h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ul className="space-y-1">
            {steps.map((step, i) => (
              <li key={i} className={`flex items-center gap-2 text-xs ${step.done ? 'text-green-500 font-medium' : 'text-[var(--text-muted)]'}`}>
                <i className={`fas ${step.done ? 'fa-check-circle' : 'fa-circle-notch fa-spin'} w-3`} />
                {step.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={uploading}
        className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-sm tracking-[1px] uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      >
        {uploading
          ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando…</>
          : <><i className="fas fa-upload" /> Subir foto</>
        }
      </button>
    </form>
  )
}
