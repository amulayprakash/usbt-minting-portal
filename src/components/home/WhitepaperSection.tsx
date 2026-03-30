import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilePdf, ArrowRight, X } from '@phosphor-icons/react';
import Button from '../ui/Button';

export default function WhitepaperSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      // Reset loading state when reopening
      setIsPdfLoaded(false);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <section className="relative py-24 mb-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 pointer-events-none" />
        
        <div className="max-w-[1280px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 border border-slate-200 dark:border-white/10 rounded-[2rem] p-10 md:p-14 bg-white dark:bg-[#0d0d1a] shadow-[0_16px_40px_-12px_rgba(6,182,212,0.1)] text-center md:text-left">
          
          <div className="flex-1 max-w-2xl flex flex-col items-center md:items-start">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.02em] text-slate-900 dark:text-white mb-4">
              The USBT Whitepaper
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
              Dive deep into the architecture, economics, and technical foundation of USBT. Learn how we ensure 1:1 parity, transparent reserves, and instant on-chain redemptions.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              className="group shadow-lg hover:-translate-y-1 transition-all duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              <FilePdf weight="fill" size={20} className="mr-2.5" />
              Read Whitepaper
              <ArrowRight weight="bold" className="ml-2.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex-shrink-0 relative">
             <div className="relative rounded-[1.5rem] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8 shadow-2xl border border-white/50 dark:border-white/10 transform md:rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-slate-300 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-bl-3xl rounded-tr-[1.5rem] shadow-sm flex items-center justify-center">
                   <div className="w-8 h-[2px] bg-slate-400 dark:bg-slate-500 transform rotate-45 -mr-4 -mt-4 opacity-50" />
                </div>
                
                <div className="w-16 h-16 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 border border-cyan-500/20">
                  <FilePdf size={32} weight="duotone" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-12">
                  USBT Protocol
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mb-6">
                  v1.0.0 · Core Architecture
                </p>
                
                <div className="space-y-3 w-48">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-4/6" />
                </div>
             </div>
             
             {/* Abstract glows */}
             <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none" />
          </div>

        </div>
      </section>

      {/* PDF Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-6xl h-full sm:max-h-[90vh] bg-white dark:bg-[#0d0d1a] rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0d0d1a] z-20">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <FilePdf size={20} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-tight">USBT Whitepaper</h3>
                    <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400">PDF Document</p>
                  </div>
                </div>
                
                {/* Desktop close button / Mobile secondary close */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 sm:w-10 sm:h-10 px-3 sm:px-0 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg sm:rounded-xl bg-slate-200/50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-semibold sm:hidden">Close</span>
                  <X size={20} weight="bold" />
                </button>
              </div>
              
              {/* PDF embed */}
              <div className="flex-1 w-full bg-slate-100 dark:bg-[#080812] overflow-hidden relative">
                
                {/* Loading State Overlay */}
                {!isPdfLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-[#080812] z-10">
                    <div className="w-12 h-12 flex items-center justify-center mb-4 relative">
                      <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                      Loading PDF Document...
                    </p>
                  </div>
                )}

                <iframe
                  src={
                    typeof window !== 'undefined' && window.innerWidth < 768 && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
                      ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/USBT - Whitepaper.pdf')}&embedded=true` 
                      : "/USBT%20-%20Whitepaper.pdf"
                  }
                  className={`w-full h-full border-0 absolute inset-0 transition-opacity duration-300 ${isPdfLoaded ? 'opacity-100' : 'opacity-0'}`}
                  title="USBT Whitepaper"
                  onLoad={() => setIsPdfLoaded(true)}
                />
              </div>

              {/* Mobile-only sticky bottom close action */}
              <div className="flex-shrink-0 sm:hidden p-4 bg-white dark:bg-[#0d0d1a] border-t border-slate-200 dark:border-white/10 z-20">
                 <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    className="shadow-2xl"
                    onClick={() => setIsModalOpen(false)}
                 >
                    Done Reading
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
