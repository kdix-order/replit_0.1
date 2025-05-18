# 味店焼マン - 近畿大学Eキャンパス店 フードオーダーアプリケーション

![味店焼マン](/public/assets/yakiman-logo.png)

## 概要

「味店焼マン」は、近畿大学Eキャンパス店向けのモバイルフレンドリーな飲食店注文Webアプリケーションです。お客様がメニューから商品を選び、カスタマイズして注文し、店舗での受け取りを簡単に行えるシステムを提供します。スマートフォンに最適化された操作性と、PayPay決済に対応した便利な注文フローが特徴です。

### 主な機能

- **ユーザー認証**: JWT認証とGoogle OAuth対応（近畿大学ドメイン制限付き）
- **メニュー表示**: 商品カテゴリ分け、詳細情報、価格表示
- **商品カスタマイズ**: 5種類のサイズ選択、トッピング、カスタマイズオプション
- **カート機能**: 商品の追加、数量調整、削除（数量バッジ付き）
- **注文処理**: 受け取り時間選択（現在時刻+5分〜、10分間隔、各枠最大10名）、PayPay決済連携
- **注文履歴**: 過去の注文履歴の閲覧と状態確認
- **注文ステータス追跡**: 注文状況の確認と呼出番号表示（201-300の番号範囲）
- **管理画面**: 
  - 注文管理（展開/折りたたみ表示）
  - 注文受付制御（専用の受付開始・停止ボタン）
  - ステータス更新（調理中、完了）
  - フィードバック分析（感情評価、スコア分析）
  - リアルタイム更新（自動1分更新 + 手動更新）
- **フィードバック機能**: 4段階評価と感情分析（ポジティブ/ネガティブ）による顧客体験データ収集
- **店舗状態同期**: 画面遷移時と定期的な店舗営業状態の確認（60秒ごと）
- **リアルタイム通知**: 注文状態変更時のビジュアル通知
- **ソーシャルメディア連携**: YouTube、Instagram、TikTok、X（Twitter）へのリンク

## 技術スタック

- **フロントエンド**: React, TypeScript, TailwindCSS, Shadcn UI
- **バックエンド**: Node.js, Express
- **データベース**: インメモリストレージ (本番環境ではPostgreSQLに対応可能)
- **認証**: JWT, Google OAuth 2.0（ドメイン制限対応）
- **決済**: PayPay API連携
- **UI/UX**: 直感的なモバイルファーストデザイン、アニメーション効果、視覚的フィードバック
- **その他**: TanStack Query, React Hook Form, Zod, Framer Motion, React Icons

## ローカル開発環境のセットアップ

### 前提条件

- Node.js v18以上
- npm v8以上

### インストール手順

1. リポジトリをクローンします：

```bash
git clone https://github.com/yourusername/ajiten-yakiman.git
cd ajiten-yakiman
```

2. 依存関係をインストールします：

```bash
npm install
```

3. 環境変数を設定します（`.env.example`を参考に`.env`ファイルを作成）：

```
# JWT認証用シークレット
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth設定
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_ALLOWED_DOMAINS=kindai.ac.jp,itp.kindai.ac.jp

# PayPay API設定
PAYPAY_API_KEY=your_paypay_api_key
PAYPAY_API_SECRET=your_paypay_api_secret
PAYPAY_MERCHANT_ID=your_paypay_merchant_id
PAYPAY_REDIRECT_URL=http://localhost:5000/payment/callback
```

4. 開発サーバーを起動します：

```bash
npm run dev
```

5. ブラウザで以下のURLにアクセスします：`http://localhost:5000`

## モックとデモモード

このアプリケーションには以下のモック/デモ機能が実装されています：

- **デモユーザー認証**: 実際のGoogle認証を使わずにデモユーザーでログインできます
  - 管理者ユーザー: ユーザー名 `admin`、パスワード `admin123`
  - 一般ユーザー: ユーザー名 `customer`、パスワード `customer123`

- **PayPay決済モック**: 実際のPayPay APIがなくても決済フロー全体をテストできます
  - `server/paypay.ts`の`createPayment`関数内の条件分岐でAPIキーの有無を判断
  - APIキーがない場合は自動的にモードで動作（QRコード表示や処理中表示も含む）

- **注文呼出番号システム**: 注文の呼出番号は201-300の範囲で循環
  - サーバー側で`storage.ts`の`getNextCallNumber`関数で管理
  - 300に達すると自動的に201にリセット

- **インメモリストレージ**: データベースを使わずアプリを動作させるための実装
  - `server/storage.ts`にすべてのデータストレージロジックが含まれています
  - 本番環境ではPostgreSQLなどのデータベースに置き換え可能

## 外部サービス連携方法

### Google OAuth設定方法

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. 「APIとサービス」>「認証情報」から OAuth 2.0 クライアントIDを作成
3. 承認済みのリダイレクトURIに`http://localhost:5000/api/auth/google/callback`を追加
4. .envファイルに`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を設定
5. ドメイン制限を設定する場合は`GOOGLE_ALLOWED_DOMAINS`に許可するドメインをカンマ区切りで設定

### PayPay API連携方法

1. [PayPay for Developers](https://developer.paypay.ne.jp/)でアカウント作成
2. サンドボックス環境のAPIキーとシークレットを取得
3. .envファイルに`PAYPAY_API_KEY`、`PAYPAY_API_SECRET`、`PAYPAY_MERCHANT_ID`を設定
4. `PAYPAY_REDIRECT_URL`にコールバックURLを設定

## プロジェクト構造

```
.
├── packages/                   # モノレポパッケージ
│   ├── client/                 # フロントエンド関連ファイル
│   │   ├── src/                # Reactソースコード
│   │   │   ├── components/     # UIコンポーネント
│   │   │   │   ├── layout/     # レイアウト関連（ヘッダー、フッター、ナビ）
│   │   │   │   ├── ui/         # 共通UIコンポーネント（shadcn UI）
│   │   │   │   └── ...         # 機能別コンポーネント
│   │   │   ├── hooks/          # カスタムフック
│   │   │   ├── lib/            # ユーティリティ関数
│   │   │   └── pages/          # ページコンポーネント
│   ├── server/                 # バックエンド関連ファイル
│   │   ├── index.ts            # サーバーエントリーポイント
│   │   ├── routes.ts           # APIルート定義
│   │   ├── storage.ts          # データストレージ
│   │   ├── paypay.ts           # PayPay API連携
│   │   └── vite.ts             # Vite開発サーバー設定
│   └── shared/                 # 共有ファイル
│       └── schema.ts           # データモデルとZodスキーマ
├── turbo.json                  # Turborepo設定ファイル
└── amplify.yml                 # AWS Amplify設定ファイル
```

## 主要ファイル説明

- **server/paypay.ts**: PayPay決済APIの連携コード。APIキーが設定されていない場合はモックモードで動作
- **server/routes.ts**: すべてのAPIエンドポイント（認証、商品、カート、注文、管理機能など）
- **server/storage.ts**: インメモリデータストレージの実装。実サービスではDBに置き換え
- **client/src/hooks/use-paypay.ts**: PayPay決済処理のReactフック
- **client/src/hooks/use-auth.ts**: 認証状態管理のReactフック
- **client/src/components/order-status-tracker.tsx**: 注文状態トラッカーのアニメーション実装
- **client/src/components/paypay-payment-dialog.tsx**: PayPay決済UIダイアログ

## モックデータの編集方法

サンプルデータ（商品メニュー、時間枠など）は `server/storage.ts` の `initializeData` メソッド内で定義されています。アプリケーションの起動時に自動的にロードされます。

```typescript
// server/storage.ts の該当部分
private initializeData() {
  // 商品サンプルデータの追加
  const sampleProducts: InsertProduct[] = [
    // ここに商品を追加/編集
  ];
  
  // 時間枠サンプルデータの生成
  // ここで時間枠の設定を編集
}
```

## デモアカウント

アプリケーションにはデモ用のアカウントが用意されています：

- **お客様デモユーザー**: 
  - ユーザー名: `customer`
  - パスワード: `customer123`
  - 権限: 一般ユーザー（注文機能にアクセス可能）

- **管理者デモユーザー**: 
  - ユーザー名: `admin`
  - パスワード: `admin123`
  - 権限: 管理者（管理画面にアクセス可能）

## 機能詳細

### 商品カスタマイズ

- **サイズ選択**: ガールズサイズ、並、ご飯大、おかず大、大大
- **カスタマイズオプション**: 玉子抜き、お肉少なめ、からあげ少なめなど
  - これらのオプションは`shared/schema.ts`で定義されています

### 注文フロー

1. メニューから商品を選択
2. 商品をカスタマイズしてカートに追加
3. カートで注文内容を確認
4. 受け取り時間を選択（10分間隔、最大容量10件/枠）
5. PayPayで決済（モックモード使用可）
6. 呼出番号を確認して注文完了（番号範囲: 201-300）

### 管理機能

- **注文一覧**: 新規注文、調理中、完了済みの注文を管理
- **注文状態更新**: 注文ステータスのワンクリック更新
- **注文受付制御**: 繁忙時などに一時的に注文受付を停止可能
- **フィードバック分析**: 顧客からのフィードバックデータを表示

## 呼出番号システム

注文が確定すると201-300の範囲内で呼出番号が割り当てられます：

- 番号は`storage.ts`の`getNextCallNumber()`メソッドで管理
- 300に達すると自動的に201に戻る循環システム
- 注文確認画面と受け取り画面で赤色(#e80113)で大きく表示

## 環境変数

アプリケーションで使用する環境変数は`.env.example`ファイルに記載されています：

```
# JWT認証
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_ALLOWED_DOMAINS=kindai.ac.jp,itp.kindai.ac.jp

# PayPay API
PAYPAY_API_KEY=your_paypay_api_key
PAYPAY_API_SECRET=your_paypay_api_secret
PAYPAY_MERCHANT_ID=your_paypay_merchant_id
PAYPAY_REDIRECT_URL=http://localhost:5000/payment/callback
```

## 最近の機能アップデート

### 2025年4月15日
- 管理者画面に専用の受付開始・停止ボタンを追加（より直感的な操作が可能に）
- 商品カスタマイズダイアログから白枠を削除し、背景色を#fff9dcに統一
- ダイアログが開かれるたびに店舗設定を最新の状態に更新するよう改善
- 画面遷移時（メニュー、カート画面）に店舗設定を自動更新
- メニュー画面では60秒ごとに店舗設定を自動更新（最新の受付状態を反映）
- パフォーマンス最適化のため、未使用のアニメーションコンポーネントを削除
- すべてのコードにJSDocコメントを追加してコードリーディングを容易に

## モノレポ構造

このプロジェクトはTurborepoを使用したモノレポ構造を採用しています。コードは以下のパッケージに分かれています：

- `packages/client` - フロントエンドのReactアプリケーション
- `packages/server` - バックエンドのExpressサーバー
- `packages/shared` - クライアントとサーバー間で共有されるスキーマや型定義

### モノレポ開発

```bash
# 全パッケージの依存関係をインストール
npm install

# 開発サーバーを起動（クライアントとサーバーの両方）
npm run dev

# ビルド
npm run build

# 型チェック
npm run check
```

AWS Amplifyでデプロイする際は、フロントエンドとバックエンドが別々のビルドプロセスで処理されます。amplify.ymlファイルで設定されています。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
