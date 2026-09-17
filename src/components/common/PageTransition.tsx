import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/** Cross-fades a workspace or console page as the route changes, so moving between sections
 * feels continuous instead of snapping. The surrounding chrome (sidebar, header) stays put
 * because only this subtree is keyed by the path. */
export function PageTransition({ children, className }: {children: React.ReactNode;className?: string;}) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}>

        {children}
      </motion.div>
    </AnimatePresence>);

}
