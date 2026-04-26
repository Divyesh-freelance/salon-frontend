import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from '../../api/services'

const footerLinks = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'FAQ', to: '#' },
  { label: 'Careers', to: '#' },
]

export default function Footer() {
  const { data } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get, staleTime: 1000 * 60 * 30 })
  const settings = data?.data || {}

  return (
    <footer className="bg-neutral-50 border-t border-stone-200 w-full mt-24">
      <div className="max-w-7xl mx-auto px-12 py-20 flex flex-col items-center gap-12">
        <div className="text-xl font-serif tracking-widest text-stone-900 uppercase">
          RajLaxmi Makeup Studio
        </div>

        <div className="flex flex-wrap justify-center gap-10">
          {footerLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="font-sans tracking-[0.1em] text-xs uppercase text-stone-500 hover:text-stone-900 underline transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Social Links */}
        {(settings.instagramUrl || settings.facebookUrl || settings.pinterestUrl) && (
          <div className="flex flex-wrap justify-center gap-8">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="text-stone-400 hover:text-pink-500 transition-colors font-serif text-sm">
                Instagram
              </a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                className="text-stone-400 hover:text-blue-500 transition-colors font-serif text-sm">
                Facebook
              </a>
            )}
            {settings.pinterestUrl && (
              <a href={settings.pinterestUrl} target="_blank" rel="noopener noreferrer"
                className="text-stone-400 hover:text-red-600 transition-colors font-serif text-sm">
                Pinterest
              </a>
            )}
            <Link to="/socials" className="text-stone-400 hover:text-amber-600 transition-colors font-serif text-sm">
              Videos
            </Link>
          </div>
        )}

        <div className="font-sans tracking-[0.1em] text-xs uppercase text-stone-800 opacity-50">
          © {new Date().getFullYear()} RAJLAXMI MAKEUP STUDIO. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  )
}
