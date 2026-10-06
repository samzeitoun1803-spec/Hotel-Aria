import { motion, type HTMLMotionProps } from 'framer-motion'
import { ease } from '../../lib/motion'

/** Apparition douce à l'entrée dans le viewport. */
export function Reveal({ delay = 0, y = 28, children, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, ease: ease.expo, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
