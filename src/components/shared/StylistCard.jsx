import { motion } from 'framer-motion'
import { getImageUrl } from '../../utils/format'

export default function StylistCard({ stylist, index = 0 }) {
  return (
    <motion.div
      className="group text-center"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-stone-100">
        <motion.img
          src={getImageUrl(stylist.image)}
          alt={stylist.name}
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          loading="lazy"
        />
        <motion.div
          className="absolute inset-0 border border-transparent group-hover:border-stone-900 transition-all duration-500"
        />
      </div>
      <h3 className="font-serif text-xl mb-1">{stylist.name}</h3>
      <p className="font-sans text-xs uppercase tracking-widest text-amber-700 mb-2">{stylist.title}</p>
      <p className="font-sans text-sm text-stone-500">{stylist.specialization}</p>
    </motion.div>
  )
}
