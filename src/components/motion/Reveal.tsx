import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const EASE = [0.23, 1, 0.32, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}

const components = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span
};

export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = components[as];

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.3, ease: EASE, delay }}>
      
      {children}
    </Component>);

}