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
    queryKey: ["/api/store-settings"],
    staleTime: 1000 * 30, // 30秒間キャッシュ
    refetchInterval: 1000 * 60, // 1分ごとに更新
    retry: 3, // エラー時に3回まで再試行
  });

  return {
    storeSettings,
    isAcceptingOrders: storeSettings?.acceptingOrders ?? true, // デフォルトでは注文可能と判断
    isLoading,
    error,
    refetch,
  };
}

// 管理者用の店舗設定更新フック
export function useUpdateStoreSettings() {
  const updateStoreSettings = async (acceptingOrders: boolean): Promise<StoreSettings> => {
    try {
      console.log(`Updating store settings: acceptingOrders=${acceptingOrders}`);
      
      const response = await fetch("/api/admin/store-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ acceptingOrders }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update store settings");
      }

      const updatedSettings = await response.json();
      console.log("Store settings updated successfully:", updatedSettings);
      
      // 両方のキャッシュを更新（管理者用と一般ユーザー用）
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/store-settings"] });
      
      return updatedSettings;
    } catch (error) {
      console.error("Error updating store settings:", error);
      throw error;
    }
  };

  return { updateStoreSettings };
}