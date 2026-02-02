import { useAppServices } from "@/context";
import { useAsync } from "@/lib/hooks/useAsync";
import type { UserProfile } from "@/lib/user/types/UserProfile";

export function useCurrentUser() {
  const { userProfile } = useAppServices();

  return useAsync<UserProfile>(
    () => userProfile.getProfile(),
    true
  );
}
