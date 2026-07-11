import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { fetchInventoryItems } from "../../services/itemService";
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from "../../types/item";
import type { InventoryItem } from "../../types/item";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";

interface ItemSelectorProps {
  itemId: string;
  quantity: number;
  itemError?: string;
  quantityError?: string;
  onItemChange: (itemId: string, maxQuantity: number) => void;
  onQuantityChange: (quantity: number) => void;
  onItemBlur: () => void;
  onQuantityBlur: () => void;
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
  const { tokens, isAuthenticated } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const accessToken = isAuthenticated ? tokens?.access : undefined;
  const authError =
    !isAuthenticated || !accessToken
      ? "برای مشاهده لیست اقلام باید وارد سامانه شوید."
      : null;
  const loadError = authError ?? fetchError;

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isMounted = true;

    const loadItems = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const results = await fetchInventoryItems(accessToken);
        if (isMounted) {
          setItems(results);
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(
            error instanceof Error
              ? error.message
              : "دریافت لیست اقلام ناموفق بود. لطفاً دوباره تلاش کنید.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadItems();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === itemId),
    [itemId, items],
  );

  const maxQuantity = useMemo(() => {
    if (!selectedItem) {
      return MAX_ITEM_QUANTITY;
    }

    return Math.min(MAX_ITEM_QUANTITY, selectedItem.quantity);
  }, [selectedItem]);

  const quantityOptions = useMemo(() => {
    if (maxQuantity < MIN_ITEM_QUANTITY) {
      return [];
    }

    return Array.from(
      { length: maxQuantity },
      (_, index) => index + MIN_ITEM_QUANTITY,
    );
  }, [maxQuantity]);

  const handleItemChange = (nextItemId: string) => {
    const nextItem = items.find((item) => String(item.id) === nextItemId);
    const nextMaxQuantity = nextItem
      ? Math.min(MAX_ITEM_QUANTITY, nextItem.quantity)
      : MAX_ITEM_QUANTITY;

    onItemChange(nextItemId, nextMaxQuantity);
  };

  const itemOptions = items.map((item) => ({
    value: String(item.id),
    label: `${item.item_name} (${item.category})`,
    disabled: item.quantity < MIN_ITEM_QUANTITY,
  }));

  const quantityDropdownOptions = quantityOptions.map((option) => ({
    value: String(option),
    label: `${option} عدد`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">
          لیست اقلام
        </span>
        {authError ? (
          <p className="text-body-sm text-error">{authError}</p>
        ) : isLoading ? (
          <p className="text-body-sm text-mute">در حال بارگذاری اقلام...</p>
        ) : loadError ? (
          <p className="text-body-sm text-error">{loadError}</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-mute">کالایی در انبار موجود نیست.</p>
        ) : (
          <ResponsiveDropdown
            value={itemId}
            onChange={handleItemChange}
            onBlur={onItemBlur}
            options={itemOptions}
            placeholder="انتخاب اقلام مورد نظر"
            panelTitle="لیست اقلام"
          />
        )}
        {itemError ? (
          <p className="mt-2 text-body-sm text-error">{itemError}</p>
        ) : null}
      </label>

      <label className="block glass-card p-4">
        <span className="mb-3 block text-body-sm-strong text-ink">تعداد</span>
        <ResponsiveDropdown
          value={String(quantity)}
          onChange={(nextValue) => onQuantityChange(Number(nextValue))}
          onBlur={onQuantityBlur}
          disabled={!itemId || quantityOptions.length === 0}
          options={quantityDropdownOptions}
          placeholder="ابتدا کالا را انتخاب کنید"
          panelTitle="تعداد"
        />
        {selectedItem && maxQuantity < MAX_ITEM_QUANTITY ? (
          <p className="mt-2 text-body-sm text-mute">
            حداکثر {maxQuantity} عدد بر اساس موجودی انبار
          </p>
        ) : null}
        {quantityError ? (
          <p className="mt-2 text-body-sm text-error">{quantityError}</p>
        ) : null}
      </label>
    </div>
  );
}
