import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { fetchInventoryItems } from '../../services/itemService'
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from '../../types/item'
import type { InventoryItem } from '../../types/item'

interface ItemSelectorProps {
  itemId: string
  quantity: number
  itemError?: string
  quantityError?: string
  onItemChange: (itemId: string, maxQuantity: number) => void
  onQuantityChange: (quantity: number) => void
  onItemBlur: () => void
  onQuantityBlur: () => void
}

export function ItemSelector({
  itemId,
  quantity,
  itemError,
  quantityError,
  onItemChange,
  onQuantityChange,
  onItemBlur,
  onQuantityBlur,
}: ItemSelectorProps) {
  const { tokens, isAuthenticated } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const accessToken = isAuthenticated ? tokens?.access : undefined
  const authError =
    !isAuthenticated || !accessToken ? 'برای مشاهده لیست اقلام باید وارد سامانه شوید.' : null
  const loadError = authError ?? fetchError

  useEffect(() => {
    if (!accessToken) {
      return
    }

    let isMounted = true

    const loadItems = async () => {
      setIsLoading(true)
      setFetchError(null)

      try {
        const results = await fetchInventoryItems(accessToken)
        if (isMounted) {
          setItems(results)
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(
            error instanceof Error
              ? error.message
              : 'دریافت لیست اقلام ناموفق بود. لطفاً دوباره تلاش کنید.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadItems()

    return () => {
      isMounted = false
    }
  }, [accessToken])

  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === itemId),
    [itemId, items],
  )

  const maxQuantity = useMemo(() => {
    if (!selectedItem) {
      return MAX_ITEM_QUANTITY
    }

    return Math.min(MAX_ITEM_QUANTITY, selectedItem.quantity)
  }, [selectedItem])

  const quantityOptions = useMemo(() => {
    if (maxQuantity < MIN_ITEM_QUANTITY) {
      return []
    }

    return Array.from({ length: maxQuantity }, (_, index) => index + MIN_ITEM_QUANTITY)
  }, [maxQuantity])

  const handleItemChange = (nextItemId: string) => {
    const nextItem = items.find((item) => String(item.id) === nextItemId)
    const nextMaxQuantity = nextItem
      ? Math.min(MAX_ITEM_QUANTITY, nextItem.quantity)
      : MAX_ITEM_QUANTITY

    onItemChange(nextItemId, nextMaxQuantity)
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">لیست اقلام</span>
        {authError ? (
          <p className="text-body-sm text-error">{authError}</p>
        ) : isLoading ? (
          <p className="text-body-sm text-mute">در حال بارگذاری اقلام...</p>
        ) : loadError ? (
          <p className="text-body-sm text-error">{loadError}</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-mute">کالایی در انبار موجود نیست.</p>
        ) : (
          <select
            value={itemId}
            onChange={(event) => handleItemChange(event.target.value)}
            onBlur={onItemBlur}
            className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30"
          >
            <option value="">انتخاب اقلام مورد نظر</option>
            {items.map((item) => (
              <option key={item.id} value={String(item.id)} disabled={item.quantity < MIN_ITEM_QUANTITY}>
                {item.item_name} ({item.category})
              </option>
            ))}
          </select>
        )}
        {itemError ? <p className="mt-2 text-body-sm text-error">{itemError}</p> : null}
      </label>

      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">تعداد</span>
        <select
          value={quantity}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          onBlur={onQuantityBlur}
          disabled={!itemId || quantityOptions.length === 0}
          className="h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-ash"
        >
          {quantityOptions.length === 0 ? (
            <option value={MIN_ITEM_QUANTITY}>ابتدا کالا را انتخاب کنید</option>
          ) : (
            quantityOptions.map((option) => (
              <option key={option} value={option}>
                {option} عدد
              </option>
            ))
          )}
        </select>
        {selectedItem && maxQuantity < MAX_ITEM_QUANTITY ? (
          <p className="mt-2 text-body-sm text-mute">
            حداکثر {maxQuantity} عدد بر اساس موجودی انبار
          </p>
        ) : null}
        {quantityError ? <p className="mt-2 text-body-sm text-error">{quantityError}</p> : null}
      </label>
    </div>
  )
}
