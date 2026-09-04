import { useState, useEffect } from 'react'
import type { Photo } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const LOCAL_PHOTOS_KEY = 'portfolio_local_photos'

export function usePhotos(categoryId?: string | null) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPhotos() {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured) {
        const saved = localStorage.getItem(LOCAL_PHOTOS_KEY)
        let list: Photo[] = []
        if (saved) {
          try {
            list = JSON.parse(saved)
          } catch {
            list = []
          }
        }
        if (categoryId) {
          list = list.filter((p) => p.category_id === categoryId)
        }
        if (!cancelled) {
          setPhotos(list)
          setLoading(false)
        }
        return
      }

      try {
        const queryPromise = supabase
          .from('photos')
          .select('*, category:categories(id, name, slug, created_at)')
          .order('created_at', { ascending: false })

        const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 3500)
        )

        let targetQuery = queryPromise
        if (categoryId) {
          targetQuery = targetQuery.eq('category_id', categoryId)
        }

        const { data, error: sbError } = await Promise.race([targetQuery, timeoutPromise])

        if (!cancelled) {
          if (!sbError && data && Array.isArray(data)) {
            setPhotos(data as Photo[])
          } else {
            // Cargar fotos locales subidas
            const saved = localStorage.getItem(LOCAL_PHOTOS_KEY)
            let list: Photo[] = saved ? JSON.parse(saved) : []
            if (categoryId) list = list.filter((p) => p.category_id === categoryId)
            setPhotos(list)
          }
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          const saved = localStorage.getItem(LOCAL_PHOTOS_KEY)
          setPhotos(saved ? JSON.parse(saved) : [])
          setLoading(false)
        }
      }
    }

    fetchPhotos()
    return () => { cancelled = true }
  }, [categoryId])

  const deletePhoto = async (photo: Photo) => {
    if (!isSupabaseConfigured) {
      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photo.id)
        const localUploaded = updated.filter((p) => !p.id.startsWith('static-'))
        localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(localUploaded))
        return updated
      })
      return { error: null }
    }

    // Eliminar archivos del storage
    const keysToDelete: string[] = [photo.storage_key]
    if (photo.thumbnail_key) keysToDelete.push(photo.thumbnail_key)

    await supabase.storage.from('photos').remove(keysToDelete)

    // Eliminar row de la base de datos
    const { error } = await supabase.from('photos').delete().eq('id', photo.id)
    if (!error) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    }
    return { error }
  }

  return { photos, loading, error, setPhotos, deletePhoto }
}
