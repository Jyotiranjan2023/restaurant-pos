import { useState, useCallback } from 'react'

export default function useCart() {
  const [items, setItems] = useState([])

  // Add product to cart — increment qty if exists, else new row
  const addItem = useCallback((product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id)
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          gstPercent: Number(product.gstPercent),
          quantity: 1,
        },
      ]
    })
  }, [])

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      setItems((current) =>
        current.filter((item) => item.productId !== productId)
      )
    } else {
      setItems((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }, [])

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}