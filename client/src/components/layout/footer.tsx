import React from "react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800 md:block hidden">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <svg className="h-6 w-6 text-white mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
              </svg>
              <span className="text-lg font-bold text-white">味店焼マン</span>
            </div>
            <span className="text-sm text-gray-300">
              &copy; {new Date().getFullYear()} 味店焼マン. All rights reserved.
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center">
            <div className="mt-4 flex justify-center md:mt-0 mb-4 md:mb-0">
              <Link href="#">
                <div className="text-sm text-gray-300 hover:text-[#fee10b] cursor-pointer">
                  利用規約
                </div>
              </Link>
              <span className="mx-2 text-gray-500">·</span>
              <Link href="#">
                <div className="text-sm text-gray-300 hover:text-[#fee10b] cursor-pointer">
                  プライバシーポリシー
                </div>
              </Link>
              <span className="mx-2 text-gray-500">·</span>
              <Link href="#">
                <div className="text-sm text-gray-300 hover:text-[#fee10b] cursor-pointer">
                  お問い合わせ
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
