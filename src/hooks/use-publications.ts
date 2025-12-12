'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export function usePublications() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchPublications = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)

      const response = await fetch(`/api/publications?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('خطا در دریافت انتشارات')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت انتشارات')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createPublication = useCallback(async (publicationData: {
    name: string
    description?: string
    avatar?: string
    website?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    about?: string
    isPrivate?: boolean
  }) => {
    if (!session) {
      throw new Error('لطفاً وارد حساب کاربری خود شوید')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در ایجاد انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    fetchPublications,
    createPublication,
    loading,
    error
  }
}

export function usePublication(id: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const fetchPublication = useCallback(async () => {
    if (!id) return null

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/publications/${id}`)
      
      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [id])

  const updatePublication = useCallback(async (updateData: Partial<{
    name: string
    description: string
    avatar: string
    website: string
    twitter: string
    instagram: string
    linkedin: string
    about: string
    isPrivate: boolean
  }>) => {
    if (!session) {
      throw new Error('لطفاً وارد حساب کاربری خود شوید')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در ویرایش انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ویرایش انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [id, session])

  const deletePublication = useCallback(async () => {
    if (!session) {
      throw new Error('لطفاً وارد حساب کاربری خود شوید')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در حذف انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [id, session])

  return {
    fetchPublication,
    updatePublication,
    deletePublication,
    loading,
    error
  }
}

export function useFollowPublication(publicationId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const followPublication = useCallback(async () => {
    if (!session) {
      throw new Error('لطفاً وارد حساب کاربری خود شوید')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/publications/${publicationId}/follow`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در دنبال کردن انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دنبال کردن انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [publicationId, session])

  const unfollowPublication = useCallback(async () => {
    if (!session) {
      throw new Error('لطفاً وارد حساب کاربری خود شوید')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/publications/${publicationId}/follow`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در لغو دنبال کردن انتشار')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در لغو دنبال کردن انتشار')
      throw err
    } finally {
      setLoading(false)
    }
  }, [publicationId, session])

  return {
    followPublication,
    unfollowPublication,
    loading,
    error
  }
}