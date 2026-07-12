import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import { fetchBlocks } from "../../services/blockService";
import type { Block } from "../../services/blockService";
import { ResponsiveDropdown } from "../ui/ResponsiveDropdown";

interface BlockDropdownProps {
  blockId: string;
  error?: string;
  onChange: (blockId: string) => void;
  onBlur: () => void;
  onBlockSelect?: (block: Block | null) => void;
  placeholder?: string;
}

export function BlockDropdown({
  blockId,
  error,
  onChange,
  onBlur,
  onBlockSelect,
  placeholder = "انتخاب بلوک",
}: BlockDropdownProps) {
  const { tokens, isAuthenticated } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const accessToken = isAuthenticated ? tokens?.access : undefined;
  const authError =
    !isAuthenticated || !accessToken
      ? "برای مشاهده بلوک‌ها باید وارد سامانه شوید."
      : null;

  const loadBlocks = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const results = await fetchBlocks(accessToken);
      setBlocks(results);
    } catch (loadError) {
      setFetchError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت لیست بلوک‌ها ناموفق بود. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks, retryKey]);

  useEffect(() => {
    if (!blockId) {
      onBlockSelect?.(null);
      return;
    }

    const selected =
      blocks.find((block) => String(block.id) === blockId) ?? null;
    onBlockSelect?.(selected);
  }, [blockId, blocks, onBlockSelect]);

  const blockOptions = blocks.map((block) => ({
    value: String(block.id),
    label: block.name,
  }));

  return (
    <label className="block glass-card p-4">
      <span className="mb-3 block text-body-sm-strong text-ink">
        انتخاب بلوک
      </span>
      {authError ? (
        <p className="text-body-sm text-error">{authError}</p>
      ) : isLoading ? (
        <p className="text-body-sm text-mute">در حال بارگذاری بلوک‌ها...</p>
      ) : fetchError ? (
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-error">{fetchError}</p>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="self-start rounded-md bg-secondary-bg px-4 py-2 text-button-sm text-on-secondary transition-colors hover:bg-secondary-pressed"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <ResponsiveDropdown
          value={blockId}
          onChange={onChange}
          onBlur={onBlur}
          options={blockOptions}
          placeholder={placeholder}
          panelTitle="انتخاب بلوک"
        />
      )}
      {error ? <p className="mt-2 text-body-sm text-error">{error}</p> : null}
    </label>
  );
}
