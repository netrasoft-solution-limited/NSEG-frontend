import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { heroMessages } from '../../data/heroMessages';
import { EASE } from '../motion/Reveal';

const ROTATE_MS = 5200;

interface HeroMessageProps {
  align?: 'center' | 'start';
  headlineClass: string;
  subClass: string;
}

export function HeroMessage({ align = 'center', headlineClass, subClass }: HeroMessageProps) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % heroMessages.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduced, paused]);

  const message = heroMessages[index];
  const words = message.headline.split(' ');

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={align === 'center' ? 'flex flex-col items-center' : 'flex flex-col items-start'}>
      
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.h1
            key={message.id}
            className={`${headlineClass} ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
            aria-live="polite">
            
            {words.map((word, wordIndex) =>
            <span
              key={`${message.id}-${wordIndex}`}
              className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              
                <motion.span
                className="inline-block will-change-transform"
                initial={reduced ? false : { y: '110%' }}
                animate={{ y: '0%' }}
                exit={
                reduced ?
                undefined :
                { y: '-110%', transition: { duration: 0.24, ease: EASE, delay: wordIndex * 0.02 } }
                }
                transition={{ duration: 0.3, ease: EASE, delay: reduced ? 0 : wordIndex * 0.035 }}>
                
                  <span className={word === message.highlight ? 'text-gate' : undefined}>{word}</span>
                  {wordIndex < words.length - 1 ? '\u00A0' : ''}
                </motion.span>
              </span>
            )}
          </motion.h1>
        </AnimatePresence>
      </div>

      <div className={`relative ${align === 'center' ? 'mx-auto' : ''} mt-5 min-h-[3.5rem] w-full sm:min-h-[3rem]`}>
        <AnimatePresence mode="wait">
          <motion.p
            key={`${message.id}-sub`}
            className={`${subClass} ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE, delay: reduced ? 0 : 0.1 }}>
            
            {message.sub}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className={`mt-6 flex items-center gap-2 ${align === 'center' ? 'justify-center' : 'justify-start'}`}
        role="tablist"
        aria-label="Hero messages">
        
        {heroMessages.map((item, itemIndex) => {
          const isActive = itemIndex === index;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.headline}
              onClick={() => setIndex(itemIndex)}
              className="group h-1.5 overflow-hidden rounded-full bg-white/12 transition-colors duration-150 ease-out hover:bg-white/25"
              style={{ width: isActive ? 44 : 18 }}>
              
              {isActive &&
              <motion.span
                key={`${item.id}-${paused ? 'paused' : 'running'}`}
                className="block h-full rounded-full bg-gate"
                initial={{ width: reduced ? '100%' : '0%' }}
                animate={{ width: '100%' }}
                transition={reduced || paused ? { duration: 0 } : { duration: ROTATE_MS / 1000, ease: 'linear' }} />

              }
            </button>);

        })}
      </div>
    </div>);

}