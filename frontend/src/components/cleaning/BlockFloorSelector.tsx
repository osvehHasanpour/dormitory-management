import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { fetchBlocks, fetchFloors } from '../../services/cleaningService'
import type { Block, Floor } from '../../types/cleaning'

interface BlockFloorSelectorProps {
  blockId: string
  floorId: string
  blockError?: string
  floorError?: string
  onBlockChange: (blockId: string) => void
  onFloorChange: (floorId: string) => void
  onBlockBlur: () => void
  onFloorBlur: () => void
  onBlockSelect?: (block: Block | null) => void
  onFloorSelect?: (floor: Floor | null) => void
}

export function BlockFloorSelector({
  blockId,
  floorId,
  blockError,
  floorError,
  onBlockChange,
  onFloorChange,
  onBlockBlur,
  onFloorBlur,
  onBlockSelect,
  onFloorSelect,
}: BlockFloorSelectorProps) {
  const { tokens, isAuthenticated } = useAuth()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false)
  const [isLoadingFloors, setIsLoadingFloors] = useState(false)
  const [blocksError, setBlocksError] = useState<string | null>(null)
  const [floorsError, setFloorsError] = useState<string | null>(null)
  const [blocksRetryKey, setBlocksRetryKey] = useState(0)
  const [floorsRetryKey, setFloorsRetryKey] = useState(0)

  const accessToken = isAuthenticated ? tokens?.access : undefined
  const authError =
    !isAuthenticated || !accessToken ? 'برای مشاهده بلوک‌ها باید وارد سامانه شوید.' : null

  const loadBlocks = useCallback(async () => {
    if (!accessToken) {
      return
    }

    setIsLoadingBlocks(true)
    setBlocksError(null)

    try {
      const results = await fetchBlocks(accessToken)
      setBlocks(results)
    } catch (error) {
      setBlocksError(
        error instanceof Error
          ? error.message
          : 'دریافت لیست بلوک‌ها ناموفق بود. لطفاً دوباره تلاش کنید.',
      )
    } finally {
      setIsLoadingBlocks(false)
    }
  }, [accessToken])

  useEffect(() => {
    void loadBlocks()
  }, [loadBlocks, blocksRetryKey])

  useEffect(() => {
    if (!accessToken || !blockId) {
      setFloors([])
      onFloorSelect?.(null)
      return
    }

    let isMounted = true

    const loadFloorsList = async () => {
      setIsLoadingFloors(true)
      setFloorsError(null)

      try {
        const results = await fetchFloors(blockId, accessToken)
        if (isMounted) {
          setFloors(results)
        }
      } catch (error) {
        if (isMounted) {
          setFloorsError(
            error instanceof Error
              ? error.message
              : 'دریافت لیست طبقات ناموفق بود. لطفاً دوباره تلاش کنید.',
          )
          setFloors([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingFloors(false)
        }
      }
    }

    void loadFloorsList()

    return () => {
      isMounted = false
    }
  }, [accessToken, blockId, floorsRetryKey, onFloorSelect])

  useEffect(() => {
    if (!blockId) {
      onBlockSelect?.(null)
      return
    }

    const selected = blocks.find((block) => String(block.id) === blockId) ?? null
    onBlockSelect?.(selected)
  }, [blockId, blocks, onBlockSelect])

  useEffect(() => {
    if (!floorId) {
      onFloorSelect?.(null)
      return
    }

    const selected = floors.find((floor) => String(floor.id) === floorId) ?? null
    onFloorSelect?.(selected)
  }, [floorId, floors, onFloorSelect])

  const handleBlockChange = (nextBlockId: string) => {
    onBlockChange(nextBlockId)
    onFloorChange('')
    onFloorSelect?.(null)
  }

  const selectClassName =
    'h-11 w-full rounded-md border border-stone bg-canvas px-4 text-body-md text-ink outline-none transition-colors focus:border-2 focus:border-primary focus:ring-[3px] focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-ash'

  return (
    <>
      <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
        <span className="mb-3 block text-body-sm-strong text-ink">انتخاب بلوک</span>
        {authError ? (
            <p className="text-body-sm text-error">{authError}</p>
        ) : isLoadingBlocks ? (
          <p className="text-body-sm text-mute">در حال بارگذاری بلوک‌ها...</p>
        ) : blocksError ? (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-error">{blocksError}</p>
            <button
              type="button"
              onClick={() => setBlocksRetryKey((key) => key + 1)}
              className="self-start rounded-md bg-secondary-bg px-4 py-2 text-button-sm text-on-secondary transition-colors hover:bg-secondary-pressed"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <select
            value={blockId}
            onChange={(event) => handleBlockChange(event.target.value)}
            onBlur={onBlockBlur}
            className={selectClassName}
          >
            <option value="">همه بلوک‌ها</option>
            {blocks.map((block) => (
              <option key={block.id} value={String(block.id)}>
                {block.name}
              </option>
            ))}
          </select>
        )}
        {blockError ? <p className="mt-2 text-body-sm text-error">{blockError}</p> : null}
      </label>

      <label className="block rounded-md border border-hairline bg-canvas p-4 shadow-elevated">
        <span className="mb-3 block text-body-sm-strong text-ink">انتخاب طبقه</span>
        {!blockId ? (
          <p className="text-body-sm text-mute">ابتدا بلوک را انتخاب کنید.</p>
        ) : authError ? (
          <p className="text-body-sm text-error">{authError}</p>
        ) : isLoadingFloors ? (
          <p className="text-body-sm text-mute">در حال بارگذاری طبقات...</p>
        ) : floorsError ? (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-error">{floorsError}</p>
            <button
              type="button"
              onClick={() => setFloorsRetryKey((key) => key + 1)}
              className="self-start rounded-md bg-secondary-bg px-4 py-2 text-button-sm text-on-secondary transition-colors hover:bg-secondary-pressed"
            >
              تلاش مجدد
            </button>
          </div>
        ) : floors.length === 0 ? (
          <p className="text-body-sm text-mute">طبقه‌ای برای این بلوک یافت نشد.</p>
        ) : (
          <select
            value={floorId}
            onChange={(event) => onFloorChange(event.target.value)}
            onBlur={onFloorBlur}
            className={selectClassName}
          >
            <option value="">همه طبقه‌ها</option>
            {floors.map((floor) => (
              <option key={floor.id} value={String(floor.id)}>
                {floor.label}
              </option>
            ))}
          </select>
        )}
        {floorError ? <p className="mt-2 text-body-sm text-error">{floorError}</p> : null}
      </label>
    </>
  )
}
