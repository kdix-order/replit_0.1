import * as React from 'react';

/**
 * メニューページのモックコンポーネント
 * アクセシビリティテスト用に簡略化されたバージョン
 */
export const MockMenu: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1>メニュー</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2>商品名</h2>
          <p>説明文</p>
          <div className="flex justify-between items-center mt-4">
            <span>¥500</span>
            <button className="bg-yellow-400 text-black px-4 py-2 rounded">注文する</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * カートページのモックコンポーネント
 * アクセシビリティテスト用に簡略化されたバージョン
 */
export const MockCart: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1>カート</h1>
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2>商品名</h2>
            <p>サイズ: 並</p>
          </div>
          <div className="flex items-center">
            <span>¥500</span>
            <button className="ml-4 bg-gray-200 px-2 py-1 rounded">削除</button>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <span>合計</span>
          <span>¥500</span>
        </div>
        <button className="w-full bg-yellow-400 text-black px-4 py-2 rounded mt-4">注文する</button>
      </div>
    </div>
  );
};

/**
 * 管理者ページのモックコンポーネント
 * アクセシビリティテスト用に簡略化されたバージョン
 */
export const MockAdmin: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1>管理画面</h1>
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2>注文一覧</h2>
        <div className="border-t mt-4">
          <div className="flex justify-between items-center py-4 border-b">
            <div>
              <p>注文番号: 201</p>
              <p>商品: 焼きそば 並</p>
            </div>
            <div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">受付済み</span>
              <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">準備開始</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
