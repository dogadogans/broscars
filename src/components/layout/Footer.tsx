export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-sm text-white/40">
      <p>
        Broscar &copy; {new Date().getFullYear()} &mdash;{' '}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/70"
        >
          Açık Kaynak
        </a>{' '}
        &mdash; MIT Lisansı
      </p>
      {/* TODO: Uncomment for V2 when TMDB integration is added */}
      {/* <p className="mt-1">This product uses the TMDB API but is not endorsed or certified by TMDB.</p> */}
    </footer>
  )
}
