'use client'

import { useEffect, useState } from 'react'
import {
  onSnapshot,
  query,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QueryConstraint,
} from 'firebase/firestore'

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
}

export function useCollection<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  ...queryConstraints: QueryConstraint[]
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const q: Query<T> =
      queryConstraints.length > 0
        ? query(collectionRef, ...queryConstraints)
        : query(collectionRef)

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
          })) as T[]
        )
        setLoading(false)
      },
      (err) => {
        console.error('Firestore subscription error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()

    // Query constraints must trigger a new Firestore subscription when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionRef, ...queryConstraints])

  return { data, loading, error }
}