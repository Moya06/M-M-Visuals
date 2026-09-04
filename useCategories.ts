import { useState, useEffect } from 'react'
import type { Category } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const LOCAL_CATS_KEY = 'portfolio_local_categories'
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Naturaleza', slug: 'naturaleza', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Retrato', slug: 'retrato', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Urbana', slug: 'urbana', created_at: new Date().toISOString() },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    setError(null)

    // Helper con timeout para no dejar colgada la pantalla
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 3500)
    )

    try {
      const queryPromise = supabase
        .from('categories')
        .select('*')
        .order('name')

      const { data, error: sbError } = await Promise.race([queryPromise, timeoutPromise])

      if (!sbError && data && Array.isArray(data)) {
        setCategories(data as Category[])
        localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(data))
      } else {
        // Fallback a almacenamiento local si Supabase falla verdaderamente
        const saved = localStorage.getItem(LOCAL_CATS_KEY)
        if (saved) {
          try {
            setCategories(JSON.parse(saved))
          } catch {
            setCategories(DEFAULT_CATEGORIES)
          }
        } else {
          localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(DEFAULT_CATEGORIES))
          setCategories(DEFAULT_CATEGORIES)
        }
      }
    } catch {
      const saved = localStorage.getItem(LOCAL_CATS_KEY)
      setCategories(saved ? JSON.parse(saved) : DEFAULT_CATEGORIES)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Primero, si Supabase está activo, intentamos guardar y asegurar el UUID real.
    try {
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 3000)
      )
      const insertPromise = supabase.from('categories').insert({ name, slug }).select().single()
      const { data, error } = await Promise.race([insertPromise, timeoutPromise])

      if (!error && data) {
        const updated = [...categories, data as Category].sort((a, b) => a.name.localeCompare(b.name))
        setCategories(updated)
        localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(updated))
        return { data: data as Category, error: null }
      }
    } catch (err) {
      // Ignoramos y hacemos fallback local
    }

    // SI FALLA SUPABASE O NO ESTÁ CONF: Guardar localmente
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      created_at: new Date().toISOString(),
    }
    const updated = [...categories, newCat].sort((a, b) => a.name.localeCompare(b.name))
    setCategories(updated)
    localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(updated))

    return { data: newCat, error: null }
  }

  const updateCategory = async (id: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    if (!isSupabaseConfigured) {
      const updated = categories.map((c: Category) => (c.id === id ? { ...c, name, slug } : c))
      setCategories(updated)
      localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(updated))
      return { data: { id, name, slug }, error: null }
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setCategories((prev: Category[]) =>
        prev.map((c: Category) => (c.id === id ? (data as Category) : c)).sort((a: Category, b: Category) => a.name.localeCompare(b.name))
      )
    }
    return { data, error }
  }

  const deleteCategory = async (id: string) => {
    // Si la categoría tiene un ID falso/mock ('cat-1', 'cat-2', etc) no debe ir a Supabase
    if (!isSupabaseConfigured || id.startsWith('cat-')) {
      const updated = categories.filter((c: Category) => c.id !== id)
      setCategories(updated)
      localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(updated))
      return { error: null }
    }

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories((prev: Category[]) => prev.filter((c: Category) => c.id !== id))
    }
    return { error }
  }

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch: fetchCategories }
}
