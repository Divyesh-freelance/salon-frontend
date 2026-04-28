import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { productsApi } from '../../api/services'
import { useCart } from '../../context/CartContext'
import { formatPrice, getImageUrl } from '../../utils/format'
import Loader from '../../components/shared/Loader'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, isInCart, getItem } = useCart()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  })

  const product = data?.data
  const related = product?.related || []

  if (isLoading) return <div className="flex justify-center py-48"><Loader size="lg" /></div>
  if (!product) return (
    <div className="flex flex-col items-center justify-center py-48">
      <p className="font-serif text-2xl text-stone-500 mb-6">Product not found</p>
      <Link to="/products" className="font-sans text-xs uppercase tracking-widest text-amber-700 hover:underline">← Back to Products</Link>
    </div>
  )

  const images = [product.thumbnail, ...(product.gallery || [])].filter(Boolean)
  const inCart = isInCart(product.id)
  const cartItem = getItem(product.id)

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) return
    addItem(product, qty)
    toast.success(`${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    addItem(product, qty)
    navigate('/cart')
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-sans text-xs text-stone-400 uppercase tracking-wider mb-12">
          <Link to="/products" className="hover:text-stone-900 transition-colors">Products</Link>
          <span>/</span>
          {product.category && <><span className="hover:text-stone-900 cursor-pointer" onClick={() => navigate(`/products?category=${product.categoryId}`)}>{product.category.name}</span><span>/</span></>}
          <span className="text-stone-700">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div>
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-square bg-stone-50 overflow-hidden mb-4"
            >
              <img
                src={getImageUrl(images[activeImg])}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-stone-900' : 'border-transparent hover:border-stone-300'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <span className="font-sans text-xs text-amber-700 uppercase tracking-[0.25em] mb-3 block">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-serif text-3xl text-stone-900">{formatPrice(product.finalPrice)}</span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="font-sans text-lg text-stone-400 line-through">{formatPrice(product.price)}</span>
                  <span className="bg-amber-600 text-white px-3 py-1 font-sans text-sm font-bold">
                    -{Math.round(product.discountPercentage)}% OFF
                  </span>
                </>
              )}
            </div>

            {product.shortDesc && <p className="font-sans text-stone-600 leading-relaxed mb-6">{product.shortDesc}</p>}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="font-sans text-xs uppercase tracking-widest text-stone-500">
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity + CTA */}
            {product.stockQuantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-stone-200">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-stone-600 hover:bg-stone-50 transition-colors font-sans text-lg leading-none">−</button>
                  <span className="px-6 py-3 font-sans text-sm font-semibold min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))} className="px-4 py-3 text-stone-600 hover:bg-stone-50 transition-colors font-sans text-lg leading-none">+</button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-4 font-sans text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                    inCart ? 'bg-amber-700 text-white' : 'bg-stone-900 text-white hover:bg-amber-700'
                  }`}
                >
                  {inCart ? `In Cart (${cartItem?.quantity}) ✓` : 'Add to Cart'}
                </motion.button>
              </div>
            )}

            <motion.button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 border border-stone-900 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mb-10"
            >
              Buy Now
            </motion.button>

            <div className="border-t border-stone-100 pt-8 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Description</h3>
                <p className="font-sans text-stone-600 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>

              {/* Benefits */}
              {product.benefits && (
                <div>
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Benefits</h3>
                  <p className="font-sans text-stone-600 leading-relaxed whitespace-pre-line">{product.benefits}</p>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && (
                <div>
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">Ingredients</h3>
                  <p className="font-sans text-stone-600 leading-relaxed text-sm">{product.ingredients}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-stone-100">
          <h2 className="font-serif text-3xl text-stone-900 mb-10">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group">
                <div className="aspect-square bg-stone-50 overflow-hidden mb-3">
                  <img src={getImageUrl(p.thumbnail)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <h4 className="font-serif text-base text-stone-900 group-hover:text-amber-700 transition-colors leading-snug mb-1 line-clamp-2">{p.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm text-stone-700">{formatPrice(p.finalPrice)}</span>
                  {p.discountPercentage > 0 && (
                    <span className="font-sans text-xs text-amber-700">-{Math.round(p.discountPercentage)}%</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
