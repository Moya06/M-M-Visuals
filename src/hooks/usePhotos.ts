import { useState, useEffect } from 'react'
import type { Photo } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getLocalPhotos, deleteLocalPhoto as removeLocalPhoto, updateLocalPhoto } from '../lib/localPhotoStore'

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
        let list = await getLocalPhotos()
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
          const localList = await getLocalPhotos()
          const localMap = new Map(localList.map((p) => [p.id, p]))

          if (!sbError && data && Array.isArray(data)) {
            // Combinar con metadatos locales (como is_private) por si Supabase aún no tiene la columna
            const mergedList = (data as Photo[]).map((p) => {
              const loc = localMap.get(p.id)
              return {
                ...p,
                is_private: p.is_private !== undefined && p.is_private !== null ? p.is_private : (loc?.is_private ?? false),
              }
            })
            setPhotos(mergedList)
          } else {
            // Cargar fotos locales subidas
            let list = localList
            if (categoryId) list = list.filter((p) => p.category_id === categoryId)
            setPhotos(list)
          }
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          const list = await getLocalPhotos()
          setPhotos(categoryId ? list.filter((p) => p.category_id === categoryId) : list)
          setLoading(false)
        }
      }
    }

    fetchPhotos()
    return () => { cancelled = true }
  }, [categoryId])

  const deletePhoto = async (photo: Photo) => {
    if (!isSupabaseConfigured) {
      await removeLocalPhoto(photo.id)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
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
      await removeLocalPhoto(photo.id)
    }
    return { error }
  }

  const updatePhoto = async (id: string, updates: Partial<Photo>) => {
    // 1. Actualización optimista del estado local
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates }
        }
        return p
      })
    )

    // 2. Persistir en almacenamiento local
    await updateLocalPhoto(id, updates)

    // 3. Persistir en Supabase si está activo
    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {}
        if (updates.title !== undefined) payload.title = updates.title
        if (updates.description !== undefined) payload.description = updates.description
        if (updates.category_id !== undefined) payload.category_id = updates.category_id
        if (updates.is_private !== undefined) payload.is_private = updates.is_private

        let { error: updateErr } = await supabase.from('photos').update(payload).eq('id', id)

        // Si falla por columna is_private inexistente en Supabase, reintentar sin esa columna
        if (updateErr && updateErr.message && updateErr.message.includes('is_private')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.is_private
          if (Object.keys(fallbackPayload).length > 0) {
            const retry = await supabase.from('photos').update(fallbackPayload).eq('id', id)
            updateErr = retry.error
          } else {
            updateErr = null
          }
        }

        if (updateErr) {
          return { error: updateErr }
        }
      } catch (err) {
        return { error: err }
      }
    }

    return { error: null }
  }

  return { photos, loading, error, setPhotos, deletePhoto, updatePhoto }
}
