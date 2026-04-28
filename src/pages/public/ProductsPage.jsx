import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { productsApi } from '../../api/services'
import { useCart } from '../../context/CartContext'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'
import EmptyState from '../../components/shared/EmptyState'

const SORT_OPTIONS = [
  { value: 'sortOrder', label: 'Featured' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Highest Discount' },
]

function ProductCard({ product, index }) {
  const { addItem, isInCart } = useCart()
  const inCart = isInCart(product.id)

  const handleAdd = (e) => {
    e.preventDefault()
    if (product.stockQuantity === 0) return
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white border border-stone-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-stone-50">
          <img
            src={getImageUrl(product.thumbnail)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-amber-600 text-white px-2 py-1 font-sans text-xs font-bold">
              -{Math.round(product.discountPercentage)}%
            </span>
          )}
          {product.stockQuantity === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="font-sans text-xs uppercase tracking-widest text-stone-500 font-semibold">Out of Stock</span>
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-stone-900 text-white px-2 py-1 font-sans text-xs font-semibold uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        {product.category && (
          <p className="font-sans text-xs text-amber-700 uppercase tracking-widest mb-1">{product.category.name}</p>
        )}
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif text-lg text-stone-900 leading-snug mb-2 hover:text-amber-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.shortDesc && (
          <p className="font-sans text-xs text-stone-500 line-clamp-2 mb-3">{product.shortDesc}</p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="font-serif text-lg text-stone-900">{formatPrice(product.finalPrice)}</span>
          {product.discountPercentage > 0 && (
            <span className="font-sans text-sm text-stone-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            disabled={product.stockQuantity === 0}
            className={`flex-1 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
              inCart
                ? 'bg-amber-700 text-white'
                : product.stockQuantity === 0
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-amber-700'
            }`}
          >
            {inCart ? 'In Cart ✓' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link
            to={`/products/${product.slug}`}
            className="px-4 py-2.5 border border-stone-200 font-sans text-xs uppercase tracking-wider text-stone-600 hover:border-stone-900 transition-all duration-300"
          >
            View
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState('')
  const [sort, setSort] = useState('sortOrder')
  const [discountOnly, setDiscountOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const params = {
    active: 'true', limit: 48, sort,
    ...(activeCategory && { category: activeCategory }),
    ...(discountOnly && { discount: 'true' }),
    ...(featuredOnly && { featured: 'true' }),
  }

  const { data: categoriesData } = useQuery({ queryKey: ['product-categories'], queryFn: productsApi.getCategories })
  const { data, isLoading } = useQuery({ queryKey: ['products', params], queryFn: () => productsApi.getAll(params) })

  const categories = categoriesData?.data || []
  const products = data?.data || []

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-48 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="font-sans text-xs font-semibold text-amber-700 uppercase tracking-[0.3em] mb-4 block">
            Our Products
          </span>
          <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight">
            Curated beauty <br />essentials.
          </h1>
          <p className="font-sans text-lg text-stone-600 leading-relaxed">
            Premium salon-grade products, handpicked by our stylists for use at home.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          {/* Category pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-5 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                !activeCategory ? 'bg-stone-900 text-stone-50' : 'border border-stone-200 text-stone-600 hover:border-stone-900'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat.id ? 'bg-stone-900 text-stone-50' : 'border border-stone-200 text-stone-600 hover:border-stone-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={discountOnly} onChange={(e) => setDiscountOnly(e.target.checked)} className="w-4 h-4 accent-amber-700" />
              <span className="font-sans text-xs text-stone-600 uppercase tracking-wider">On Sale</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} className="w-4 h-4 accent-amber-700" />
              <span className="font-sans text-xs text-stone-600 uppercase tracking-wider">Featured</span>
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="admin-input !w-auto !py-2 text-xs cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-section-gap">
        {isLoading ? (
          <div className="flex justify-center py-32"><Loader size="lg" /></div>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" message="Try adjusting your filters" />
        ) : (
          <AnimatePresence mode="wait">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </AnimatePresence>
        )}
      </section>
    </>
  )
}
