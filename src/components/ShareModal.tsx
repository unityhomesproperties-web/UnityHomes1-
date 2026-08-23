import React, { useState } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, Mail, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  url: string;
  title: string;
  text: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ url, title, text, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        onClose();
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-brand-fresh)]/80 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[var(--radius-card)] p-6 shadow-sm animate-slide-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
          Share Area Intelligence
        </h3>

        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center space-x-2 bg-[var(--color-brand-fresh)] text-white px-4 py-3 rounded-[var(--radius-button)] font-semibold mb-4 hover:opacity-90 transition-opacity min-h-[48px]"
          >
            <Share2 className="w-5 h-5" />
            <span>Share via Device</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[#25D366]/10 hover:border-[#25D366] transition-colors text-[#25D366]"
          >
            <MessageCircle className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">WhatsApp</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2] transition-colors text-[#1DA1F2]"
          >
            <Twitter className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">X (Twitter)</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[#1877F2]/10 hover:border-[#1877F2] transition-colors text-[#1877F2]"
          >
            <Facebook className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">Facebook</span>
          </a>
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`}
            className="flex flex-col items-center justify-center p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] hover:bg-[var(--color-brand-medium)]/10 hover:border-[var(--color-brand-fresh)] transition-colors text-[var(--color-brand-medium)]"
          >
            <Mail className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold">Email</span>
          </a>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center space-x-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-border)] transition-colors min-h-[48px]"
        >
          {copied ? <Check className="w-5 h-5 text-[var(--color-brand-medium)]" /> : <Copy className="w-5 h-5" />}
          <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}
