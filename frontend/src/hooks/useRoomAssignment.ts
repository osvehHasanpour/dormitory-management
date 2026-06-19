import { useProfile } from './useProfile'

interface UseRoomAssignmentResult {
  blockName: string | null
  roomNumber: string | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRoomAssignment(): UseRoomAssignmentResult {
  const { profile, isLoading, error, refetch } = useProfile()

  return {
    blockName: profile?.block_name ?? null,
    roomNumber: profile?.room_number ?? null,
    isLoading,
    error,
    refetch,
  }
}
