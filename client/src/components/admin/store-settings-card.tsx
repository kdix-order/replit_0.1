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
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden mb-6">
      <CardHeader className="bg-[#e80113] text-white py-4 px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">店舗設定</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold mb-2">注文受付の状態</h3>
            <p className="text-sm text-gray-500 mb-4">
              注文の受付を一時的に停止または再開します。停止中は新規注文ができなくなります。
            </p>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-2">
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
                        duration: 3000,
                      });
                    } catch (error) {
                      console.error("Store settings update error:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "店舗設定の更新に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }
                  }}
                />
                <Label htmlFor="accepting-orders" className="cursor-pointer">
                  {isAcceptingOrders 
                    ? <span className="flex items-center text-green-600 font-bold"><PlayCircle className="w-4 h-4 mr-1" /> 注文受付中</span> 
                    : <span className="flex items-center text-red-600 font-bold"><PauseCircle className="w-4 h-4 mr-1" /> 注文停止中</span>
                  }
                </Label>
              </div>
              
              <div className="flex mt-2">
                <Button 
                  size="lg" 
                  onClick={async () => {
                    try {
                      await onToggle(true);
                      toast({
                        title: "注文受付を開始しました",
                        description: "お客様からの新規注文を受け付けられるようになりました。",
                        duration: 3000,
                      });
                    } catch (error) {
                      console.error("Error enabling order acceptance:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "注文受付の開始に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }
                  }}
                  className="mr-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base min-h-[48px]"
                  disabled={isAcceptingOrders}
                >
                  <PlayCircle className="w-5 h-5 mr-2" /> 受付開始
                </Button>
                
                <Button 
                  size="lg"
                  onClick={async () => {
                    try {
                      await onToggle(false);
                      toast({
                        title: "注文受付を停止しました",
                        description: "新規注文の受付を一時的に停止しました。",
                        duration: 3000,
                      });
                    } catch (error) {
                      console.error("Error disabling order acceptance:", error);
                      toast({
                        title: "エラーが発生しました",
                        description: "注文受付の停止に失敗しました。もう一度お試しください。",
                        variant: "destructive",
                        duration: 5000,
                      });
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base min-h-[48px]"
                  disabled={!isAcceptingOrders}
                >
                  <PauseCircle className="w-5 h-5 mr-2" /> 受付停止
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${isAcceptingOrders ? 'text-green-600' : 'text-red-600'}`}>
                {isAcceptingOrders ? '営業中' : '注文停止中'}
              </div>
              <p className="text-sm text-gray-500">
                最終更新: {storeSettings ? new Date(storeSettings.updatedAt).toLocaleString() : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}