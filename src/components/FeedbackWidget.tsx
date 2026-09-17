import { useState, useRef, useEffect } from 'react';

// Замените эту ссылку на URL вашей Google формы (режим "встроить")
const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe_example_form_id/viewform?embedded=true';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне окна
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[data-feedback-trigger]')
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        data-feedback-trigger
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Обратная связь"
      >
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-30" />
        )}

        <div
          className={`
            relative flex items-center justify-center
            w-14 h-14 rounded-full
            bg-gradient-to-br from-purple-500 to-pink-500
            shadow-lg shadow-purple-500/40
            transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-xl hover:shadow-purple-500/50
            active:scale-95
            ${isOpen ? 'rotate-0' : ''}
          `}
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </div>

        {/* Tooltip */}
        {!isOpen && isHovered && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg">
            Обратная связь
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        )}
      </button>

      {/* Popup Window */}
      <div
        ref={popupRef}
        className={`
          fixed bottom-24 right-6 z-50
          w-[360px] max-w-[calc(100vw-48px)]
          bg-gray-900 rounded-2xl
          shadow-2xl shadow-purple-500/20
          border border-purple-500/30
          transition-all duration-300 ease-out
          origin-bottom-right
          ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="text-white font-semibold text-sm">Обратная связь</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            aria-label="Закрыть"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form iframe */}
        <div className="relative bg-white rounded-b-2xl overflow-hidden">
          <iframe
            src={GOOGLE_FORM_URL}
            width="100%"
            height="450"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Форма обратной связи"
            className="block"
          >
            Загрузка…
          </iframe>
        </div>
      </div>
    </>
  );
};

export default FeedbackWidget;
