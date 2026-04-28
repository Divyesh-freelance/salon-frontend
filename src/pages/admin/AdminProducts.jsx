import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { productsApi } from '../../api/services'
import Modal from '../../components/shared/Modal'
import Loader from '../../components/shared/Loader'
import ImageUploadField from '../../components/shared/ImageUploadField'
import { formatPrice, getImageUrl } from '../../utils/format'

// ─── Product Form ──────────────────────────────────────────────────────────────
function ProductForm({ onSubmit, defaultValues, isLoading, categories }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ defaultValues })
  const thumbnail = watch('thumbnail') || ''
  const price = watch('price') || 0
  const discount = watch('discountPercentage') || 0
  const finalPrice = price ? (price * (1 - discount / 100)).toFixed(2) : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="admin-label">Product Name *</label>
          <input {...register('name', { required: true })} className="admin-input" placeholder="e.g. Argan Oil Serum" />
          {errors.name && <p className="form-error">Name is required</p>}
        </div>
        <div>
          <label className="admin-label">Category</label>
          <select {...register('categoryId')} className="admin-input">
            <option value="">No Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="admin-label">Stock Quantity *</label>
          <input {...register('stockQuantity', { required: true, valueAsNumber: true, min: 0 })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div>
          <label className="admin-label">Price (₹) *</label>
          <input {...register('price', { required: true, valueAsNumber: true, min: 0 })} type="number" step="0.01" className="admin-input" placeholder="999" />
          {errors.price && <p className="form-error">Price is required</p>}
        </div>
        <div>
          <label className="admin-label">Discount %</label>
          <input {...register('discountPercentage', { valueAsNumber: true, min: 0, max: 100 })} type="number" step="0.01" className="admin-input" placeholder="0" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Final Price (auto-calculated)</label>
          <div className="admin-input bg-stone-50 text-amber-700 font-semibold">₹ {finalPrice}</div>
        </div>
        <div className="col-span-2">
          <label className="admin-label">Short Description</label>
          <input {...register('shortDesc')} className="admin-input" placeholder="One-line product summary" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Full Description *</label>
          <textarea {...register('description', { required: true })} rows={4} className="admin-input resize-none" />
          {errors.description && <p className="form-error">Description is required</p>}
        </div>
        <div className="col-span-2">
          <label className="admin-label">Benefits</label>
          <textarea {...register('benefits')} rows={3} className="admin-input resize-none" placeholder="Key benefits of this product (one per line or paragraph)" />
        </div>
        <div className="col-span-2">
          <label className="admin-label">Ingredients</label>
          <textarea {...register('ingredients')} rows={2} className="admin-input resize-none" placeholder="Ingredient list (optional)" />
        </div>
        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>
        <div className="flex items-center gap-3 mt-6">
          <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4" />
          <label htmlFor="featured" className="font-sans text-sm text-stone-700">Featured product</label>
        </div>
        <div className="flex items-center gap-3">
          <input {...register('isActive')} type="checkbox" id="isActive" className="w-4 h-4" defaultChecked />
          <label htmlFor="isActive" className="font-sans text-sm text-stone-700">Active (visible)</label>
        </div>

        {/* Thumbnail */}
        <input type="hidden" {...register('thumbnail')} />
        <div className="col-span-2">
          <label className="admin-label">Thumbnail Image</label>
          <ImageUploadField
            value={thumbnail}
            onChange={(url) => setValue('thumbnail', url, { shouldDirty: true })}
            uploadFn={productsApi.uploadImage}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  )
}

// ─── Category Form ────────────────────────────────────────────────────────────
function CategoryModal({ isOpen, onClose, onSave, existing, isLoading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: existing || {} })
  const onSubmit = (d) => { onSave(d); reset() }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existing ? 'Edit Category' : 'Add Category'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="admin-label">Category Name *</label>
          <input {...register('name', { required: true })} className="admin-input" placeholder="e.g. Hair Care" />
          {errors.name && <p className="form-error">Name is required</p>}
        </div>
        <div>
          <label className="admin-label">Sort Order</label>
          <input {...register('sortOrder', { valueAsNumber: true })} type="number" className="admin-input" placeholder="0" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-stone-900 text-white py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Category'}
        </button>
      </form>
    </Modal>
  )
}

export default function AdminProducts() {
  const [tab, setTab] = useState('products') // 'products' | 'categories'
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const qc = useQueryClient()

  // Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productsApi.adminGetAll({ active: 'all', limit: 100 }),
  })

  // Categories
  const { data: catsData } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: productsApi.adminGetCategories,
  })

  const categories = catsData?.data || []
  const products = productsData?.data || []

  // Product mutations
  const createProd = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product created'); setModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error creating product'),
  })
  const updateProd = useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product updated'); setModalOpen(false); setEditing(null) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating product'),
  })
  const deleteProd = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted') },
    onError: () => toast.error('Error deleting product'),
  })

  // Category mutations
  const createCat = useMutation({
    mutationFn: productsApi.createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-categories'] }); toast.success('Category created'); setCatModalOpen(false) },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  })
  const deleteCat = useMutation({
    mutationFn: productsApi.removeCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-product-categories'] }); toast.success('Category deleted') },
    onError: () => toast.error('Error deleting category'),
  })

  const handleProductSubmit = (data) => {
    if (editing) updateProd.mutate({ id: editing.id, data })
    else createProd.mutate(data)
  }

  const openEdit = (p) => { setEditing(p); setModalOpen(true) }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Products</h1>
          <p className="font-sans text-sm text-stone-500 mt-1">{products.length} products · {categories.length} categories</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setCatModalOpen(true); setEditingCat(null) }}
            className="flex items-center gap-2 border border-stone-200 px-5 py-3 font-sans text-xs uppercase tracking-widest hover:border-stone-900 transition-all"
          >
            <span className="material-symbols-outlined text-sm">category</span>
            Add Category
          </button>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 border border-stone-200 p-1 w-fit mb-8">
        {['products', 'categories'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 font-sans text-xs uppercase tracking-widest transition-all ${tab === t ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'products' ? (
        isLoading ? <Loader size="lg" className="py-32" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200">
                  {['Image', 'Name', 'Category', 'Price', 'Discount', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="font-sans text-xs uppercase tracking-widest text-stone-400 py-4 pr-6 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="py-4 pr-6">
                        <div className="w-12 h-12 overflow-hidden bg-stone-100">
                          <img src={getImageUrl(p.thumbnail)} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="font-sans text-sm text-stone-900 font-medium max-w-[180px] truncate">{p.name}</p>
                        {p.featured && <span className="font-sans text-xs text-amber-700">★ Featured</span>}
                      </td>
                      <td className="py-4 pr-6 font-sans text-xs text-stone-500">{p.category?.name || '—'}</td>
                      <td className="py-4 pr-6 font-sans text-sm text-stone-700">{formatPrice(p.price)}</td>
                      <td className="py-4 pr-6 font-sans text-xs text-stone-500">{p.discountPercentage > 0 ? `${Math.round(p.discountPercentage)}%` : '—'}</td>
                      <td className="py-4 pr-6">
                        <span className={`font-sans text-xs font-semibold ${p.stockQuantity === 0 ? 'text-red-500' : p.stockQuantity < 5 ? 'text-amber-600' : 'text-stone-700'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <span className={`px-2 py-0.5 rounded-full font-sans text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                          {p.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => { if (confirm('Delete this product?')) deleteProd.mutate(p.id) }} className="p-1.5 text-stone-300 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {products.length === 0 && <p className="text-center font-sans text-stone-400 py-16">No products yet. Add your first product.</p>}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-stone-200 p-5 flex items-center justify-between">
              <div>
                <p className="font-sans text-sm font-semibold text-stone-900">{cat.name}</p>
                <p className="font-sans text-xs text-stone-400 mt-0.5">/{cat.slug}</p>
              </div>
              <button onClick={() => { if (confirm('Delete this category?')) deleteCat.mutate(cat.id) }} className="text-stone-300 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="col-span-4 text-center font-sans text-stone-400 py-16">No categories yet.</p>}
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <ProductForm
          onSubmit={handleProductSubmit}
          defaultValues={editing || { isActive: true, sortOrder: 0, discountPercentage: 0, stockQuantity: 0, featured: false }}
          isLoading={createProd.isPending || updateProd.isPending}
          categories={categories}
        />
      </Modal>

      {/* Category Modal */}
      <CategoryModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onSave={(d) => createCat.mutate(d)}
        existing={editingCat}
        isLoading={createCat.isPending}
      />
    </div>
  )
}
