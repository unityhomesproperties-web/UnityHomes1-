import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Globe, List, ShieldAlert } from 'lucide-react';

export function DevMenu({ navigate }: { navigate: (path: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 bg-white shadow-sm border border-stone-200 rounded-2xl p-2 w-48 flex flex-col gap-1 overflow-hidden"
          >
            <div className="px-3 py-2 text-[10px] font-semibold text-stone-400 uppercase tracking-widest border-b border-stone-100 mb-1">
              Dev Navigation
            </div>
            <button
              onClick={() => { navigate('/'); setIsOpen(false); }}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-[#18452E] rounded-xl transition-colors text-left"
            >
              <Globe className="w-4 h-4" />
              <span>Main Website</span>
            </button>
            <button
              onClick={() => { navigate('/waitlist'); setIsOpen(false); }}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-[#18452E] rounded-xl transition-colors text-left"
            >
              <List className="w-4 h-4" />
              <span>Waitlist Page</span>
            </button>
            <button
              onClick={() => { navigate('/waitlist-admin'); setIsOpen(false); }}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-[#18452E] rounded-xl transition-colors text-left"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Waitlist Admin</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>
    </div>
  );
}
