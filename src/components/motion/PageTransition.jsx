import { motion } from 'framer-motion'

const variants = {
  initial: {
    opacity: 0,
    clipPath: 'inset(0 0 100% 0)',
  },
  animate: {
    opacity: 1,
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    clipPath: 'inset(100% 0 0 0)',
    transition: {
      duration: 0.45,
      ease: [0.7, 0, 0.84, 0],
    },
  },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {children}
    </motion.div>
  )
}