/**
 * services/smaregiService.ts
 * 
 * スマレジAPI認証とアクセストークン管理サービス
 */

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: Date;
}

/**
 * スマレジ認証サービスクラス
 * アクセストークンの取得とキャッシュを管理します
 * 複数のリクエストが同時に実行されても安全になるよう排他制御を実装しています
 */
export class SmaregiService {
  private cachedToken: CachedToken | null = null;
  private tokenRefreshPromise: Promise<void> | null = null;

  private getTokenUrl(contractId: string, dev: boolean): string {
    const baseUrl = dev ? 'https://id.smaregi.dev/app' : 'https://id.smaregi.jp/app';
    return `${baseUrl}/${contractId}/token`;
  }

  private getApiUrl(contractId: string, dev: boolean): string {
    const baseUrl = dev ? 'https://api.smaregi.dev' : 'https://api.smaregi.jp';
    return `${baseUrl}/${contractId}`;
  }

  /**
   * 有効なアクセストークンを取得します
   * キャッシュされたトークンが有効な場合はそれを返し、
   * 無効または存在しない場合は新しく取得します
   * 複数のリクエストが同時に実行される場合、最初のリクエストのみがトークン更新を行い、
   * 他のリクエストはその完了を待機します（排他制御）
   * @returns アクセストークン
   * @throws 認証に失敗した場合
   */
  async getAccessToken(): Promise<string> {
    // キャッシュされたトークンが有効かチェック
    if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
      return this.cachedToken.accessToken;
    }

    // 既にトークン更新が進行中の場合は、その完了を待つ
    if (this.tokenRefreshPromise) {
      await this.tokenRefreshPromise;
      // 更新完了後、再度有効性をチェック
      if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
        return this.cachedToken.accessToken;
      }
    }

    // 新しいトークンを取得（排他制御）
    await this.refreshAccessTokenWithLock();
    
    if (!this.cachedToken) {
      throw new Error('Failed to obtain access token');
    }

    return this.cachedToken.accessToken;
  }

  /**
   * 排他制御を伴うトークン更新処理
   * 複数のリクエストが同時にトークン更新を試行することを防ぎます
   * @throws 認証に失敗した場合
   */
  private async refreshAccessTokenWithLock(): Promise<void> {
    // 既に更新処理が実行中の場合は待機
    if (this.tokenRefreshPromise) {
      await this.tokenRefreshPromise;
      return;
    }

    // 新しい更新処理を開始
    this.tokenRefreshPromise = this.refreshAccessToken()
      .finally(() => {
        // 処理完了後、ロックを解除
        this.tokenRefreshPromise = null;
      });

    await this.tokenRefreshPromise;
  }

  /**
   * 新しいアクセストークンを取得してキャッシュに保存します
   * スマレジAPI仕様に準拠してBasic認証とscopeパラメーターを使用します
   * @throws 認証に失敗した場合
   */
  private async refreshAccessToken(): Promise<void> {
    const clientId = process.env.SMAREGI_CLIENT_ID;
    const clientSecret = process.env.SMAREGI_CLIENT_SECRET;
    const contractId = process.env.SMAREGI_CONTRACT_ID;
    const devMode = process.env.SMAREGI_DEV_MODE === 'true'; // 開発モードかどうか
    const scope = process.env.SMAREGI_SCOPE || 'pos.stores:read pos.terminals:print'; // デフォルトでレシート印刷スコープ

    if (!clientId || !clientSecret || !contractId) {
      throw new Error('SMAREGI_CLIENT_ID, SMAREGI_CLIENT_SECRET, and SMAREGI_CONTRACT_ID must be set in environment variables');
    }

    // Basic認証用のCredentialsを作成
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: scope
    });

    try {
      const response = await fetch(this.getTokenUrl(contractId, devMode), {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData = await response.json() as TokenResponse;

      // トークンをキャッシュに保存（有効期限の90%の時点で無効とみなす）
      const expiresInMs = tokenData.expires_in * 1000 * 0.9; // 90%の時点で更新
      this.cachedToken = {
        accessToken: tokenData.access_token,
        expiresAt: new Date(Date.now() + expiresInMs)
      };

      console.log('Smaregi access token obtained and cached successfully');
    } catch (error) {
      console.error('Failed to obtain Smaregi access token:', error);
      throw error;
    }
  }

  /**
   * キャッシュされたトークンが有効かどうかをチェックします
   * @param token キャッシュされたトークン
   * @returns 有効な場合true
   */
  private isTokenValid(token: CachedToken): boolean {
    return new Date() < token.expiresAt;
  }

  /**
   * レシート印刷APIを呼び出します
   * @param contractId 契約ID
   * @param storeId 店舗ID
   * @param terminalId 端末ID
   * @param receiptImageUrl レシート画像URL
   * @throws API呼び出しに失敗した場合
   */
  async printReceipt(
    contractId: string, 
    storeId: string, 
    terminalId: string, 
    receiptImageUrl: string
  ): Promise<void> {
    const devMode = process.env.SMAREGI_DEV_MODE === 'true'; // 開発モードかどうか
    const accessToken = await this.getAccessToken();

    const printData = {
      printImageUrl: receiptImageUrl,
      printerType: "3" // 3: 引換券控え
    };

    const response = await fetch(
      `${this.getApiUrl(contractId, devMode)}/pos/stores/${storeId}/terminals/${terminalId}/prints`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(printData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Smaregi API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  /**
   * キャッシュされたトークンをクリアします（主にテスト用途）
   * 進行中のトークン更新処理もキャンセルします
   */
  clearTokenCache(): void {
    this.cachedToken = null;
    this.tokenRefreshPromise = null;
  }
}

export const smaregiService = new SmaregiService();