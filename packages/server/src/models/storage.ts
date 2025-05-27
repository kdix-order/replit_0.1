/**
 * models/storage.ts
 * 
 * ストレージモジュールの型定義
 * IStorageインターフェースを実装したストレージインスタンスの型を提供します。
 */

import type { IStorage } from "../../storage/istorage";

export type StorageInstance = IStorage;

export type GetStorage = () => StorageInstance;
