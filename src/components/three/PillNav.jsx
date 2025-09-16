import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const PillNav = ({
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const navItems = navItemsRef.current;

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };


  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const hasOnClick = item => item && typeof item.onClick === 'function';
  const hasHref = item => item && item.href;

  // Theme colors based on your CSS
  const themeColors = {
    primary: '#ff6b47',
    primaryHover: '#ff8a65',
    dark: '#2d2d2d',
    light: '#ffffff',
    glassBg: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 107, 71, 0.3)',
    glassHover: 'rgba(255, 107, 71, 0.2)'
  };

  return (
    <div className="relative z-[1000] w-full md:w-auto max-w-full">
      <nav
        className={`w-full lg:w-max flex items-center justify-center lg:justify-start box-border px-2 lg:px-0 ${className}`}
        aria-label="Primary"
      >

        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden lg:flex h-14 bg-white/10 backdrop-blur-2xl border border-orange-500/30 shadow-lg max-w-fit"
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-1 h-full gap-1"
          >
            {items.map((item, i) => {
              const isActive = activeHref === item.href || activeHref === item.key;

              const PillContent = (
                <>
                  <span
                    className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none bg-orange-500"
                    style={{ willChange: 'transform' }}
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el;
                    }}
                  />
                  <span className="label-stack relative inline-block leading-none z-[2] flex items-center gap-1">
                    {item.icon && (
                      <span className="pill-icon relative z-[2] inline-block leading-none">
                        {item.icon}
                      </span>
                    )}
                    <span
                      className="pill-label relative z-[2] inline-block leading-none text-gray-800 font-semibold"
                      style={{ willChange: 'transform' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="pill-label-hover absolute left-0 top-0 z-[3] inline-flex items-center gap-1 text-white"
                      style={{ willChange: 'transform, opacity' }}
                      aria-hidden="true"
                    >
                      {item.icon && (
                        <span className="pill-icon-hover relative z-[3] inline-block leading-none">
                          {item.icon}
                        </span>
                      )}
                      <span className="pill-text-hover">{item.label}</span>
                    </span>
                  </span>
                  {isActive && (
                    <span
                      className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 rounded-full z-[4] bg-orange-500"
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              const basePillClasses = isActive
                ? 'relative overflow-hidden inline-flex items-center justify-center h-full py-1 md:py-2 no-underline rounded-full font-semibold text-sm md:text-base uppercase tracking-wide whitespace-nowrap cursor-pointer px-4 md:px-8 bg-white/90 text-gray-800 border border-orange-500/30 shadow-md transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105'
                : 'relative overflow-hidden inline-flex items-center justify-center h-full py-1 md:py-2 no-underline rounded-full font-semibold text-sm md:text-base uppercase tracking-wide whitespace-nowrap cursor-pointer px-4 md:px-8 bg-white/70 text-gray-800 border border-orange-500/20 shadow-sm transition-all duration-300 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105';

              return (
                <li key={item.key || item.href || i} role="none" className="flex h-full">
                  {hasOnClick(item) ? (
                    <button
                      role="menuitem"
                      onClick={item.onClick}
                      className={basePillClasses}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </button>
                  ) : hasHref(item) ? (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={basePillClasses}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href || '#'}
                      className={basePillClasses}
                      aria-label={item.ariaLabel || item.label}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      {PillContent}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="lg:hidden rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0 relative w-12 h-12 bg-white/10 backdrop-blur-2xl border border-orange-500/30 shadow-lg hover:bg-orange-500/20 transition-all duration-300"
        >
          <span
            className="hamburger-line w-5 h-0.5 rounded origin-center transition-all duration-300 ease-out bg-orange-500"
          />
          <span
            className="hamburger-line w-5 h-0.5 rounded origin-center transition-all duration-300 ease-out bg-orange-500"
          />
          
        </button>
      </nav>

      <div
        ref={mobileMenuRef}
        className="lg:hidden w-[90vw] absolute top-12  right-0 rounded-3xl shadow-2xl z-[998] origin-top bg-white/95 backdrop-blur-2xl border border-orange-500/30 mx-4"
      >
        <ul className="list-none m-0 p-1 flex flex-col gap-1">
          {items.map((item, index) => {
            const isActive = activeHref === item.href || activeHref === item.key;
            
            const linkClasses = isActive
              ? 'block w-full text-center py-4 px-5 text-sm md:text-base font-semibold rounded-full transition-all duration-300 bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg hover:scale-105 truncate'
              : 'block w-full text-center py-4 px-5 text-sm md:text-base font-semibold rounded-full transition-all duration-300 bg-white/70 text-gray-800 border border-orange-500/20 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105 truncate';

            const handleClick = () => {
              if (hasOnClick(item)) {
                item.onClick();
              }
              console.log("Clicked item:", item);
              toggleMobileMenu();
            };

            return (
              <li key={item.key || item.href || index}>
                {hasOnClick(item) ? (
                  <button
                    onClick={handleClick}
                    className={linkClasses}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && item.icon}
                      {item.label}
                    </span>
                  </button>
                ) : hasHref(item) ? (
                  <Link
                    to={item.href}
                    className={linkClasses}
                    onClick={() => toggleMobileMenu()}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && item.icon}
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={item.href || '#'}
                    className={linkClasses}
                    onClick={() => toggleMobileMenu()}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && item.icon}
                      {item.label}
                    </span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
