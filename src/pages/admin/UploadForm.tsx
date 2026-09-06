import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import { v4 as uuidv4 } from 'uuid'
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient'
import { saveLocalPhoto } from '../../lib/localPhotoStore'
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
  const [fileSizeMB, setFileSizeMB] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<ProgressStep[]>([])
  const [error, setError] = useState<string | null>(null)

  const markStep = (index: number) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, done: true } : s)))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const mb = file.size / (1024 * 1024)
    setFileSizeMB(mb)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const reset = () => {
    setPreview(null)
    setFileName('')
    setFileSizeMB(null)
    setTitle('')
    setDescription('')
    setCategoryId('')
    setIsPrivate(false)
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

    const MAX_LIMIT_MB = 15
    const MAX_BYTES = MAX_LIMIT_MB * 1024 * 1024
    const isLarge = file.size > MAX_BYTES

    setSteps([
      {
        label: isLarge
          ? `Optimizando imagen (${(file.size / 1024 / 1024).toFixed(1)} MB ➔ ~15 MB sin reducir resolución)…`
          : 'Preparando imagen (conservando 100% calidad original sin compresión)…',
        done: false,
      },
      { label: 'Generando miniatura nítida (Retina) para la cuadrícula…', done: false },
      { label: isSupabaseConfigured ? 'Subiendo imagen a Supabase Storage…' : 'Procesando imagen localmente…', done: false },
      { label: isSupabaseConfigured ? 'Subiendo miniatura a Supabase Storage…' : 'Procesando miniatura localmente…', done: false },
      { label: 'Guardando datos en el portafolio…', done: false },
    ])

    try {
      const id = uuidv4()

      // ── PASO 1: Procesar imagen principal ──
      // Si el archivo ya pesa <= 15 MB, conservamos el 100% de la calidad original intacta.
      // Si pesa > 15 MB (ej. 40 MB), se comprime inteligentemente a ~14.8 MB preservando la resolución nativa.
      let optimized: File = file
      setProgress(10)

      if (isLarge) {
        try {
          // Intento 1: Mantener la resolución nativa original (6000x4000 etc.) con máxima fidelidad
          optimized = await imageCompression(file, {
            maxSizeMB: 14.8,
            alwaysKeepResolution: true,
            initialQuality: 0.98,
            preserveExif: true,
            useWebWorker: true,
          })
        } catch {
          // Intento 2: Ajuste adaptativo con límite de 8K si el motor requiere margen
          optimized = await imageCompression(file, {
            maxSizeMB: 14.8,
            maxWidthOrHeight: 7680,
            initialQuality: 0.95,
            preserveExif: true,
            useWebWorker: true,
          })
        }
      } else {
        setProgress(25)
      }
      markStep(0)
      setProgress(35)

      // ── PASO 2: Generar thumbnail nítido (Retina / Pantallas modernas) ──
      const thumbnail = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.90,
      })
      markStep(1)
      setProgress(50)

      // Obtener dimensiones reales de la foto
      const img = new Image()
      const imgUrl = URL.createObjectURL(optimized)
      await new Promise<void>((res) => {
        img.onload = () => res()
        img.src = imgUrl
      })
      URL.revokeObjectURL(imgUrl)
      const { naturalWidth: width, naturalHeight: height } = img

      // Determinar extensiones y Content-Types
      const getExtension = (b: Blob, name: string) => {
        if (b.type === 'image/webp') return 'webp'
        if (b.type === 'image/png') return 'png'
        if (b.type === 'image/jpeg' || b.type === 'image/jpg') return 'jpg'
        const parts = name.split('.')
        return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'
      }

      const ext = getExtension(optimized, file.name)
      const optimizedKey = `optimized/${id}.${ext}`
      const thumbnailKey = `thumbnails/${id}.webp`
      const optContentType = optimized.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg')

      // ── PASO 3 y 4: Subir a Supabase o almacenar localmente con soporte de gran tamaño ──
      let url = ''
      let thumbnailUrl = ''

      if (isSupabaseConfigured) {
        const { error: uploadErr } = await supabase.storage
          .from('photos')
          .upload(optimizedKey, optimized, { contentType: optContentType, cacheControl: '31536000' })

        if (uploadErr) throw new Error(`Error subiendo imagen: ${uploadErr.message}`)
        markStep(2)
        setProgress(70)

        const { error: thumbErr } = await supabase.storage
          .from('photos')
          .upload(thumbnailKey, thumbnail, { contentType: 'image/webp', cacheControl: '31536000' })

        if (thumbErr) throw new Error(`Error subiendo miniatura: ${thumbErr.message}`)
        markStep(3)
        setProgress(85)

        const { data: optData } = supabase.storage.from('photos').getPublicUrl(optimizedKey)
        const { data: thumbData } = supabase.storage.from('photos').getPublicUrl(thumbnailKey)
        url = optData.publicUrl
        thumbnailUrl = thumbData.publicUrl
      } else {
        // Modo Local: Convertir a Data URL y guardar mediante IndexedDB (sin límites de 5 MB de localStorage)
        const fileToDataUrl = (b: Blob): Promise<string> =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(b)
          })

        url = await fileToDataUrl(optimized)
        markStep(2)
        setProgress(70)

        thumbnailUrl = await fileToDataUrl(thumbnail)
        markStep(3)
        setProgress(85)
      }

      // ── PASO 5: Insertar en base de datos o almacén local ──
      let newPhoto: Photo

      if (isSupabaseConfigured) {
        const insertPayload: any = {
          title: title.trim() || null,
          description: description.trim() || null,
          category_id: categoryId || null,
          storage_key: optimizedKey,
          thumbnail_key: thumbnailKey,
          url,
          thumbnail_url: thumbnailUrl,
          width,
          height,
          is_private: isPrivate,
        }

        let { data, error: dbErr } = await supabase
          .from('photos')
          .insert(insertPayload)
          .select('*, category:categories(id, name, slug, created_at)')
          .single()

        // Fallback por si la columna is_private aún no fue migrada en la tabla remota de Supabase
        if (dbErr && dbErr.message && dbErr.message.includes('is_private')) {
          delete insertPayload.is_private
          const retry = await supabase
            .from('photos')
            .insert(insertPayload)
            .select('*, category:categories(id, name, slug, created_at)')
            .single()
          data = retry.data
          dbErr = retry.error
        }

        if (dbErr) throw new Error(`Error guardando en DB: ${dbErr.message}`)
        newPhoto = { ...(data as Photo), is_private: isPrivate }

        // Sincronizar en almacén local
        await saveLocalPhoto(newPhoto)
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
          is_private: isPrivate,
        }

        await saveLocalPhoto(newPhoto)
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
    <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-sm">
      <h2 className="text-base sm:text-lg font-serif text-[var(--text-main)] font-bold">Subir nueva foto</h2>

      {/* Zona de archivo */}
      <div
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-[var(--accent)] transition-colors group bg-[var(--bg-primary)]/50"
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
            <i className="fas fa-cloud-arrow-up text-2xl sm:text-3xl mb-2 sm:mb-3 block text-[var(--accent)]" />
            <p className="text-xs sm:text-sm font-medium">Haz clic o arrastra una foto aquí</p>
            <p className="text-[10px] sm:text-xs mt-1 opacity-70">JPG, PNG, WEBP — Calidad profesional (hasta 15 MB por foto)</p>
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

      {fileName && fileSizeMB !== null && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <span className="text-[var(--text-main)] font-medium truncate max-w-[150px] sm:max-w-[240px]">
              <i className="fas fa-image mr-1.5 text-[var(--accent)]" />
              {fileName}
            </span>
            <span className="shrink-0 font-mono text-[var(--accent)] font-semibold ml-2 text-[11px] sm:text-xs">
              {fileSizeMB.toFixed(1)} MB
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] flex items-start gap-1.5 px-1">
            {fileSizeMB > 15 ? (
              <>
                <i className="fas fa-compress-arrows-alt text-[var(--accent)] mt-0.5" />
                <span>
                  Archivo de <strong>{fileSizeMB.toFixed(1)} MB</strong>: Se optimizará a <strong>~14-15 MB</strong> conservando su resolución original y máxima fidelidad de textura.
                </span>
              </>
            ) : (
              <>
                <i className="fas fa-check-circle text-emerald-500 mt-0.5" />
                <span>
                  Archivo de <strong>{fileSizeMB.toFixed(1)} MB</strong>: Dentro del límite de 15 MB. Se subirá al <strong>100% de calidad original</strong> sin compresión.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Metadatos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la foto (opcional)"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción amplia o narrativa (opcional)"
            rows={3}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">
            Categoría o Subcategoría
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <option value="">Sin categoría (General)</option>
            {categories.filter((c) => !c.parent_id).map((parent) => {
              const children = categories.filter((c) => c.parent_id === parent.id)
              return (
                <optgroup key={parent.id} label={`📁 ${parent.name}`}>
                  <option value={parent.id}>{parent.name} (General)</option>
                  {children.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      &nbsp;&nbsp;↳ {sub.name}
                    </option>
                  ))}
                </optgroup>
              )
            })}
            {categories.filter((c) => c.parent_id && !categories.some((p) => p.id === c.parent_id)).length > 0 && (
              <optgroup label="Otras subcategorías">
                {categories.filter((c) => c.parent_id && !categories.some((p) => p.id === c.parent_id)).map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    ↳ {sub.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Selector de visibilidad: Público o Privado */}
        <div className="col-span-2">
          <label className="block text-xs text-[var(--text-muted)] tracking-[1px] uppercase mb-1.5 font-semibold">
            Visibilidad de la fotografía
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                !isPrivate
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-main)] ring-1 ring-[var(--accent)]/30 shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--bg-primary)] opacity-65 hover:opacity-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${!isPrivate ? 'bg-[var(--accent)] text-white' : 'bg-black/10 text-[var(--text-muted)]'}`}>
                <i className="fas fa-globe text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">Pública</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-500 rounded font-semibold">Visible para todos</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                  Cualquier persona que entre al link del portafolio podrá verla.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                isPrivate
                  ? 'border-amber-500 bg-amber-500/10 text-[var(--text-main)] ring-1 ring-amber-500/30 shadow-sm'
                  : 'border-[var(--border-color)] bg-[var(--bg-primary)] opacity-65 hover:opacity-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isPrivate ? 'bg-amber-500 text-white' : 'bg-black/10 text-[var(--text-muted)]'}`}>
                <i className="fas fa-lock text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold">Privada</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/15 text-amber-500 rounded font-semibold">Solo Admin</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                  Solo tú la verás cuando tengas tu sesión iniciada de admin.
                </p>
              </div>
            </button>
          </div>
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-red-500 flex items-center gap-2.5">
          <i className="fas fa-circle-exclamation shrink-0 text-base" />
          <span className="leading-snug">{error}</span>
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
