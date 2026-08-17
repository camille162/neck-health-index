import { useUserStore } from '@/stores/userStore'

export function useFavorites() {
  const userStore = useUserStore()

  function toggle(contentId: string) {
    userStore.toggleFavorite(contentId)
  }

  function isFav(contentId: string) {
    return userStore.isFavorite(contentId)
  }

  return { toggle, isFav }
}
