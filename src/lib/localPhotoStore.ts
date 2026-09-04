import type { Photo } from '../types'

const DB_NAME = 'mm_visuals_store'
const DB_VERSION = 1
const STORE_NAME = 'photos'
const LOCAL_STORAGE_KEY = 'portfolio_local_photos'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no soportado en este entorno'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getLocalPhotos(): Promise<Photo[]> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => {
        const idbPhotos = (req.result as Photo[]) || []

        // Fusionar con posibles fotos previas en localStorage
        const legacy = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (legacy) {
          try {
            const legacyPhotos: Photo[] = JSON.parse(legacy)
            const idMap = new Set(idbPhotos.map((p) => p.id))
            legacyPhotos.forEach((lp) => {
              if (!idMap.has(lp.id)) idbPhotos.push(lp)
            })
          } catch {
            // ignorar
          }
        }

        resolve(
          idbPhotos.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        )
      }
      req.onerror = () => {
        resolve(getFromLocalStorage())
      }
    })
  } catch {
    return getFromLocalStorage()
  }
}

function getFromLocalStorage(): Photo[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!saved) return []
  try {
    return JSON.parse(saved)
  } catch {
    return []
  }
}

export async function saveLocalPhoto(photo: Photo): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(photo)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    try {
      const current = getFromLocalStorage()
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([photo, ...current]))
    } catch {
      throw new Error(
        'No se pudo almacenar la foto localmente. Configura Supabase para almacenamiento en la nube.'
      )
    }
  }
}

export async function deleteLocalPhoto(id: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // ignorar
  }

  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (saved) {
    try {
      const currentList: Photo[] = JSON.parse(saved)
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(currentList.filter((p) => p.id !== id))
      )
    } catch {
      // ignorar
    }
  }
}
