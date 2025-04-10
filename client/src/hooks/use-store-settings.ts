import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export type StoreSettings = {
  id: number;
  acceptingOrders: boolean;
  updatedAt: string;
};

// 店舗設定用のカスタムフック
export function useStoreSettings() {
  const { 
    data: storeSettings, 
    isLoading, 
    error,
    refetch 
  } = useQuery<StoreSettings>({
    queryKey: ["/api/admin/store-settings"],
    staleTime: 1000 * 60, // 1分間キャッシュ
    refetchInterval: 1000 * 60 * 5, // 5分ごとに更新
  });

  return {
    storeSettings,
    isAcceptingOrders: storeSettings?.acceptingOrders ?? true,
    isLoading,
    error,
    refetch,
  };
}

// 管理者用の店舗設定更新フック
export function useUpdateStoreSettings() {
  const updateStoreSettings = async (acceptingOrders: boolean): Promise<StoreSettings> => {
    const response = await fetch("/api/admin/store-settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ acceptingOrders }),
    });

    if (!response.ok) {
      throw new Error("Failed to update store settings");
    }

    const updatedSettings = await response.json();
    
    // キャッシュを更新
    queryClient.invalidateQueries({ queryKey: ["/api/admin/store-settings"] });
    
    return updatedSettings;
  };

  return { updateStoreSettings };
}