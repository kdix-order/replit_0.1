/**
 * 店舗設定カードコンポーネント
 * 注文受付の開始・停止を管理する設定画面を提供します
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { StoreSetting } from "@shared/schema";
import { TIME_CONSTANTS } from "@/constants/admin";

interface StoreSettingsCardProps {
  isAcceptingOrders: boolean;
  storeSettings: StoreSetting | null;
  onToggle: (accepting: boolean) => Promise<void>;
}

export function StoreSettingsCard({
  isAcceptingOrders,
  storeSettings,
  onToggle
}: StoreSettingsCardProps) {
  const { toast } = useToast();
  return (
    <section className="mb-6" aria-label="店舗設定">
      <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
        <CardHeader className="bg-[#e80113] text-white py-4 px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg font-bold">店舗設定</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold mb-2">注文受付の状態</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              注文の受付を一時的に停止または再開します。停止中は新規注文ができなくなります。
            </p>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-2" role="group" aria-label="注文受付状態の切り替え">
                <Switch 
                  id="accepting-orders"
                  checked={isAcceptingOrders}
                  onCheckedChange={async (checked: boolean) => {
                    try {
                      await onToggle(checked);
                      toast({
                        title: checked ? "注文受付を開始しました" : "注文受付を停止しました",
                        description: checked 
                          ? "お客様からの新規注文を受け付けられるようになりました。"
                          : "新規注文の受付を一時的に停止しました。",
                        duration: TIME_CONSTANTS.TOAST_DURATION.SUCCESS,
                      });
                    } catch (error) {
                      console.error("Store settings update error:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "店舗設定の更新に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: TIME_CONSTANTS.TOAST_DURATION.ERROR,
                      });
                    }
                  }}
                  className="focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
                  aria-label={isAcceptingOrders ? "注文受付を停止する" : "注文受付を開始する"}
                />
                <Label htmlFor="accepting-orders" className="cursor-pointer text-base sm:text-sm">
                  {isAcceptingOrders 
                    ? <span className="flex items-center text-green-600 font-bold"><PlayCircle className="w-4 h-4 mr-1" aria-hidden="true" /> 注文受付中</span> 
                    : <span className="flex items-center text-red-600 font-bold"><PauseCircle className="w-4 h-4 mr-1" aria-hidden="true" /> 注文停止中</span>
                  }
                </Label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button 
                  size="lg" 
                  onClick={async () => {
                    try {
                      await onToggle(true);
                      toast({
                        title: "注文受付を開始しました",
                        description: "お客様からの新規注文を受け付けられるようになりました。",
                        duration: TIME_CONSTANTS.TOAST_DURATION.SUCCESS,
                      });
                    } catch (error) {
                      console.error("Error enabling order acceptance:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "注文受付の開始に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: TIME_CONSTANTS.TOAST_DURATION.ERROR,
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
                  disabled={isAcceptingOrders}
                  aria-label="注文受付を開始する"
                >
                  <PlayCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" aria-hidden="true" /> 受付開始
                </Button>
                
                <Button 
                  size="lg"
                  onClick={async () => {
                    try {
                      await onToggle(false);
                      toast({
                        title: "注文受付を停止しました",
                        description: "新規注文の受付を一時的に停止しました。",
                        duration: TIME_CONSTANTS.TOAST_DURATION.SUCCESS,
                      });
                    } catch (error) {
                      console.error("Error disabling order acceptance:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "注文受付の停止に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: TIME_CONSTANTS.TOAST_DURATION.ERROR,
                      });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[48px] focus:ring-2 focus:ring-[#e80113] focus:ring-offset-2"
                  disabled={!isAcceptingOrders}
                  aria-label="注文受付を停止する"
                >
                  <PauseCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" aria-hidden="true" /> 受付停止
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg" role="status" aria-live="polite">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold mb-1 ${isAcceptingOrders ? 'text-green-600' : 'text-red-600'}`} aria-label={isAcceptingOrders ? '現在営業中' : '現在注文停止中'}>
                {isAcceptingOrders ? '営業中' : '注文停止中'}
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                最終更新: {storeSettings ? new Date(storeSettings.updatedAt).toLocaleString() : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </section>
  );
}