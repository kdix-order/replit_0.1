import React from "react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { FaYoutube, FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="bg-[#e80113] text-white border-t-4 border-[#ffec47] py-6 px-4 shadow-lg">
      <div className="container mx-auto max-w-2xl">
        <h2 className="font-bold text-xl mb-2 text-white">味店焼マン 近畿大学 Eキャンパス店</h2>
        <p className="text-white/80 text-sm mb-4">〒577-0813 大阪府東大阪市新上小阪２２８−３ 情報処理教育棟 (Kudos) 1F</p>
        
        {/* SNSリンク */}
        <div className="flex justify-center gap-6 mb-4">
          <a 
            href="https://www.youtube.com/@yakiman.official" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition"
            aria-label="YouTube"
          >
            <FaYoutube className="h-6 w-6" />
          </a>
          <a 
            href="https://instagram.com/yakiman.official" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition"
            aria-label="Instagram"
          >
            <FaInstagram className="h-6 w-6" />
          </a>
          <a 
            href="https://tiktok.com/@yakiman.official" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition"
            aria-label="TikTok"
          >
            <FaTiktok className="h-6 w-6" />
          </a>
          <a 
            href="https://twitter.com/yakimanCH" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition"
            aria-label="X (Twitter)"
          >
            <FaXTwitter className="h-6 w-6" />
          </a>
        </div>
        
        <Separator className="my-4 bg-white/30" />
        
        {/* 利用規約・プライバシーポリシー・お問い合わせリンク */}
        <div className="flex flex-col sm:flex-row justify-between text-sm mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-3 sm:mb-0">
            <Link href="/terms">
              <span className="text-white hover:text-white/80 transition cursor-pointer">利用規約</span>
            </Link>
            <Link href="/privacy">
              <span className="text-white hover:text-white/80 transition cursor-pointer">プライバシーポリシー</span>
            </Link>
          </div>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSc-your-google-form-id-here/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition flex items-center"
          >
            お問い合わせ <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
        
        <p className="text-white/70 text-xs font-bold">決済後の注文の変更・キャンセルはできません</p>
        <p className="text-white/70 text-xs mt-2">&copy; {new Date().getFullYear()} 味店焼マン All Rights Reserved.</p>
      </div>
    </footer>
  );
}