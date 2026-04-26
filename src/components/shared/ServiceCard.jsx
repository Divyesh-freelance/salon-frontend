import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getImageUrl, formatPrice, getDurationText } from '../../utils/format'

export default function ServiceCard({ service, index = 0 }) {
  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/service/${service.slug}`}>
        <div className="aspect-[3/4] mb-8 overflow-hidden bg-stone-200">
          <motion.img
            src={getImageUrl(service.image)}
            alt={service.title}
            className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            loading="lazy"
          />
        </div>
        <div className="text-center">
          <h3 className="font-serif text-2xl mb-2">{service.title}</h3>
          <p className="font-sans text-xs text-stone-400 uppercase tracking-widest mb-4">
            {service.category} · {getDurationText(service.duration)}
          </p>
          <span className="font-serif italic text-stone-900 block border-t border-stone-200 pt-4 mt-4">
            From {formatPrice(service.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
