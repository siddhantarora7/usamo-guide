import { useLocation } from '@gatsbyjs/reach-router';
import { ChevronDownIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import { Link, navigate } from 'gatsby';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { Github, Instagram, Twitter } from 'lucide-react';
import * as React from 'react';
import AetherFlowHero from '../components/Index/AetherFlowHero';
import LightRays from '../components/Index/LightRays';
import Layout from '../components/layout';
import SEO from '../components/seo';
import TopNavigationBar from '../components/TopNavigationBar/TopNavigationBar';
import {
  useCurrentUser,
  useIsUserDataLoaded,
} from '../context/UserDataContext/UserDataContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Index-only DARK palette:
 * - Background: midnight navy-ish
 * - Accents/content: vanilla + purple
 *
 * Requested update (image2):
 * - Use the sampled deep purple (~#70428A) for:
 *   - “AMC to Olympiad” text
 *   - “Browse Topics” button background
 * - Remove glow around “Browse Topics” (no GlowingRing wrapper, no shadow)
 */
/* Every page shares one base background; see --bg-page in src/styles/theme.css. */
const PAGE_BG = 'var(--bg-page)';

const VANILLA = '#F4EDEA';
const MAUVE = '#F0C2FF';

const TEXT_PRIMARY = VANILLA;
const TEXT_SECONDARY = 'rgba(244, 237, 234, 0.78)';
const TEXT_MUTED = 'rgba(244, 237, 234, 0.62)';
const FAQ_CARD_STYLE: React.CSSProperties = {
  background: 'var(--card-bg)',
  color: TEXT_PRIMARY,
};
const footerSocialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/usamoguide',
    icon: Instagram,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/usamoguide',
    icon: Twitter,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/usamoguide/usamo-guide',
    icon: Github,
  },
] as const;

const containerClasses = 'max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8';

/* Live preview embed: always renders whatever this module page currently is. */
const PREVIEW_PATH = '/intermediate/shoelace-theorem-p1';
/** Viewport width the embedded preview renders at, so it always shows the desktop layout. */
const PREVIEW_VIEWPORT_WIDTH = 1440;
/** Pixels per frame the preview auto-scrolls until the visitor takes over. */
const PREVIEW_SCROLL_SPEED = 0.6;

const impactStats = [
  { value: '180k+', label: 'Students reached' },
  { value: '$0', label: 'Cost, forever' },
  { value: '100%', label: 'Student-run' },
];

const builderProfiles = [
  {
    name: 'Pranav Ramesh',
    role: 'Founder & CEO',
    imageSrc: 'images/Founder_Pranav.jpg',
  },
  { name: 'Spursh Deshpande', role: 'CTO', imageSrc: 'images/CTO.jpeg' },
  { name: 'Siddhant Arora', role: 'COO', imageSrc: 'images/COO.png' },
  { name: 'Daniel Liao', role: 'CMO', imageSrc: 'images/CMO.jpeg' },
];

function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.1);
  return (
    <div
      ref={ref}
      className={classNames(
        isVisible ? 'reveal-enter' : 'opacity-0',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function FaqCard({
  id,
  question,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  question: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6 text-left" style={FAQ_CARD_STYLE}>
      <dt>
        {/* The whole header is the toggle, so clicking anywhere on the
            question opens it — not just the arrow. */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={onToggle}
          className="group flex w-full cursor-pointer items-start justify-between gap-4 text-left focus:outline-none"
        >
          <span
            className="text-lg leading-6 font-medium"
            style={{ color: TEXT_PRIMARY }}
          >
            {question}
          </span>
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#F0C2FF] transition group-hover:bg-white/5 group-hover:text-[#F4EDEA] group-focus-visible:ring-2 group-focus-visible:ring-[#F0C2FF]/60"
          >
            <ChevronDownIcon
              className={classNames(
                'h-5 w-5 transition-transform duration-500 ease-out',
                isOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </span>
          <span className="sr-only">
            {isOpen ? 'Close answer' : 'Open answer'}
          </span>
        </button>
      </dt>
      {/* grid-template-rows 0fr -> 1fr animates the height without measuring it */}
      <dd
        id={`${id}-content`}
        className="grid transition-[grid-template-rows,opacity] duration-500 ease-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={classNames('pt-2 pr-10', isOpen && 'faq-answer-enter')}
          >
            {children}
          </div>
        </div>
      </dd>
    </div>
  );
}

export default function IndexPage({ path }): JSX.Element {
  const currentUser = useCurrentUser();
  const loading = useIsUserDataLoaded();
  const location = useLocation();
  const [openFaqs, setOpenFaqs] = React.useState<Record<string, boolean>>({});

  const previewFrameRef = React.useRef<HTMLDivElement>(null);
  const previewIframeRef = React.useRef<HTMLIFrameElement>(null);
  const [previewScale, setPreviewScale] = React.useState(1);
  const [isPreviewEngaged, setIsPreviewEngaged] = React.useState(false);
  // The preview only starts scrolling itself once its entrance has finished.
  const { ref: previewRevealRef, isVisible: isPreviewRevealed } =
    useScrollReveal<HTMLDivElement>(0.2);
  const [hasPreviewSettled, setHasPreviewSettled] = React.useState(false);
  const hasPreviewSettledRef = React.useRef(false);
  hasPreviewSettledRef.current = hasPreviewSettled;

  React.useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;
    const updateScale = () =>
      setPreviewScale(frame.clientWidth / PREVIEW_VIEWPORT_WIDTH);
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // The preview scrolls itself while it's on screen. Until the visitor clicks
  // it, the iframe ignores pointer events entirely, so wheeling over the
  // preview scrolls the page instead of being swallowed by the embed.
  React.useEffect(() => {
    const frame = previewFrameRef.current;
    const iframe = previewIframeRef.current;
    if (!frame || !iframe) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let animationId: number | null = null;
    let isOnScreen = false;
    let stopped = false;
    let position = 0;
    let detachInteraction: (() => void) | null = null;

    const stop = () => {
      stopped = true;
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = null;
      detachInteraction?.();
      detachInteraction = null;
    };

    const start = () => {
      if (stopped) return;
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      // The blank document the iframe starts on is replaced once the real page
      // loads, so listeners bound to it would never fire.
      if (!win || !doc || doc.URL === 'about:blank') return;

      // A reload swaps the document out from under us: drop the old loop and
      // listeners and rebind to the document that's actually on screen.
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = null;
      detachInteraction?.();

      // These only ever fire once the preview has been clicked into, so they
      // can't be triggered by ordinary page scrolling that happens to pass
      // over the embed.
      const interactionEvents = [
        'wheel',
        'touchstart',
        'touchmove',
        'pointerdown',
        'keydown',
      ] as const;
      for (const type of interactionEvents) {
        doc.addEventListener(type, stop, { passive: true });
        win.addEventListener(type, stop, { passive: true });
      }
      detachInteraction = () => {
        for (const type of interactionEvents) {
          doc.removeEventListener(type, stop);
          win.removeEventListener(type, stop);
        }
      };

      position = win.scrollY;
      const step = () => {
        if (stopped) return;
        if (isOnScreen && hasPreviewSettledRef.current) {
          const maxScroll =
            doc.documentElement.scrollHeight - win.innerHeight - 1;
          position =
            maxScroll > 0 && position >= maxScroll
              ? 0
              : position + PREVIEW_SCROLL_SPEED;
          win.scrollTo(0, position);
        }
        animationId = requestAnimationFrame(step);
      };
      animationId = requestAnimationFrame(step);
    };

    // Clicking the preview hands scrolling over to the embed for good.
    const engage = () => {
      setIsPreviewEngaged(true);
      stop();
    };
    frame.addEventListener('pointerdown', engage);

    const onLoad = () => start();
    iframe.addEventListener('load', onLoad);
    // Already loaded (bfcache, fast navigation) — the load event won't fire again.
    if (iframe.contentDocument?.readyState === 'complete') start();

    const visibility = new IntersectionObserver(
      entries => {
        isOnScreen = entries.some(entry => entry.isIntersecting);
      },
      { threshold: 0.25 }
    );
    visibility.observe(frame);

    return () => {
      iframe.removeEventListener('load', onLoad);
      frame.removeEventListener('pointerdown', engage);
      visibility.disconnect();
      stop();
    };
  }, []);

  React.useEffect(() => {
    try {
      if (currentUser && location.state.redirect) navigate('/dashboard');
    } catch (e) {
      if (currentUser) navigate('/dashboard');
    }
  }, [currentUser, loading, location]);

  // Smooth scrolling, scoped to this page: Lenis is destroyed on unmount so the
  // rest of the site keeps native scrolling.
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis();
    let animationId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      animationId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(animationId);
      lenis.destroy();
    };
  }, []);

  React.useEffect(() => {
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const prevHtmlOverscrollY = htmlStyle.overscrollBehaviorY;
    const prevBodyOverscrollY = bodyStyle.overscrollBehaviorY;

    htmlStyle.overscrollBehaviorY = 'none';
    bodyStyle.overscrollBehaviorY = 'none';

    return () => {
      htmlStyle.overscrollBehaviorY = prevHtmlOverscrollY;
      bodyStyle.overscrollBehaviorY = prevBodyOverscrollY;
    };
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const linkStyle: React.CSSProperties = {
    color: MAUVE,
    textDecoration: 'none',
    fontWeight: 700,
  };

  const footerLinkStyle: React.CSSProperties = {
    color: 'rgba(244, 237, 234, 0.84)',
    textDecoration: 'none',
    fontWeight: 500,
  };

  const footerButtonStyle: React.CSSProperties = {
    border: '1px solid rgba(240, 194, 255, 0.34)',
    background: '#EFE3FF',
    boxShadow: 'none',
    '--pme-color': '#2C1842',
    '--pme-hover-color': '#201C36',
    '--pme-wipe-bg': '#F0C2FF',
  } as React.CSSProperties;

  const sectionHeadingClasses =
    'mx-auto flex max-w-4xl flex-col items-center text-center text-4xl font-bold tracking-tight md:text-5xl 2xl:text-6xl';
  const sectionSubtitleClasses =
    'mx-auto max-w-3xl text-center text-lg font-medium leading-relaxed md:text-xl 2xl:text-2xl';

  return (
    <Layout>
      <SEO title={null} image={null} pathname={path} />

      <div className="fixed top-0 z-50 w-full">
        <div className="backdrop-blur-lg">
          <TopNavigationBar hidePromoBar animateEntrance />
        </div>
      </div>

      {/* Begin Hero */}
      <AetherFlowHero />
      {/* End Hero */}

      {/* Wave transition: dark base */}
      <div
        className="pointer-events-none overflow-hidden leading-[0]"
        style={{ backgroundColor: PAGE_BG }}
      >
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="block h-16 w-full md:h-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,80 C300,80 400,0 600,0 C800,0 900,80 1200,80 L1200,0 L0,0 Z"
            style={{ fill: PAGE_BG }}
          />
        </svg>
      </div>

      {/* Below hero: keep dark background but page-owned text stays vanilla/purple */}
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        <div className="h-6 sm:h-10 md:h-16 2xl:h-24"></div>

        <RevealSection className="px-6 sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-6xl items-center justify-center gap-8 pb-3 md:grid-cols-[auto_auto] md:gap-x-10 md:pl-8 lg:gap-x-14 lg:pl-10">
            <div className="flex min-w-0 flex-col items-center">
              <h2
                className="text-center text-5xl font-bold md:text-6xl md:whitespace-nowrap xl:text-7xl"
                style={{ color: TEXT_PRIMARY }}
              >
                Learn Contest Math
              </h2>
              <p
                className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed font-medium md:text-xl 2xl:text-2xl"
                style={{ color: TEXT_SECONDARY }}
              >
                Carefully designed for math contest students - available to
                everyone, for free.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                src="/images/Lovemascot.png"
                alt="Lovemascot"
                className="h-32 w-auto shrink-0 object-contain md:h-40 lg:h-48 xl:h-56"
              />
            </div>
          </div>
        </RevealSection>

        <div className={containerClasses}>
          <div className="h-10 md:h-16 2xl:h-24"></div>

          <div
            ref={previewRevealRef}
            className={classNames(
              'mx-auto w-full max-w-5xl overflow-hidden rounded-2xl backdrop-blur-sm',
              isPreviewRevealed ? 'preview-enter' : 'opacity-0'
            )}
            style={{
              border: '1px solid rgba(240, 194, 255, 0.22)',
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            }}
            onAnimationEnd={event => {
              // Ignore animations bubbling up from anything inside the card.
              if (event.target === event.currentTarget) {
                setHasPreviewSettled(true);
              }
            }}
          >
            {/* Browser-style chrome above the live embed */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                borderBottom: '1px solid rgba(240, 194, 255, 0.16)',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <div
                className="flex shrink-0 items-center gap-1.5"
                aria-hidden="true"
              >
                <span className="h-3 w-3 rounded-full bg-[#F0C2FF]/70"></span>
                <span className="h-3 w-3 rounded-full bg-[#F0C2FF]/45"></span>
                <span className="h-3 w-3 rounded-full bg-[#F0C2FF]/25"></span>
              </div>
              <div className="flex-1"></div>
              <Link
                to={PREVIEW_PATH}
                className="shrink-0 font-mono text-xs whitespace-nowrap md:text-sm"
                style={linkStyle}
              >
                Open ↗
              </Link>
            </div>

            <div
              ref={previewFrameRef}
              className="relative h-[520px] w-full overflow-hidden md:h-[680px] 2xl:h-[760px]"
              style={{ background: PAGE_BG }}
            >
              <iframe
                ref={previewIframeRef}
                src={PREVIEW_PATH}
                title="Live preview of the Shoelace Theorem module"
                loading="lazy"
                className="block border-0"
                style={{
                  background: PAGE_BG,
                  width: `${PREVIEW_VIEWPORT_WIDTH}px`,
                  height: `${100 / previewScale}%`,
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                  // Let page scrolling pass straight through until the
                  // visitor clicks into the preview.
                  pointerEvents: isPreviewEngaged ? 'auto' : 'none',
                }}
              />
            </div>
          </div>

          <div className="h-16 md:h-20 2xl:h-36"></div>
        </div>
      </div>

      {/* Section divider — spans the full viewport, and is where the light rays originate */}
      <RevealSection>
        <div
          className="pointer-events-none w-full"
          style={{
            height: '1px',
            background: 'rgba(197, 139, 255, 0.45)',
          }}
        />
      </RevealSection>
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        {/* Light rays effect from divider line */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <LightRays
            raysOrigin="top-center"
            raysColor="#bd9ee5"
            raysSpeed={0.8}
            lightSpread={0.5}
            rayLength={2.5}
            pulsating={true}
            fadeDistance={1}
            saturation={0.9}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.05}
            distortion={0.1}
            className="custom-rays"
          />
        </div>
        <div className="relative z-10">
          <div className="h-16 md:h-24"></div>
          <div className={containerClasses}>
            <RevealSection>
              <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
                <div className="max-w-xl">
                  <h2
                    className="text-3xl font-bold tracking-tight md:text-4xl 2xl:text-5xl"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    Our Core Mission
                  </h2>
                  <div className="h-5"></div>
                  <p
                    className="text-lg leading-relaxed md:text-xl"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    Gatekept resources, unstructured learning, and courses that
                    cost hundreds have kept olympiad math away from the rest of
                    us. We are high schoolers who went through that ourselves,
                    and we have no intention of making money off you - we exist
                    to promote equity in learning math. Today that includes
                    supporting 100+ underprivileged students in Bangladesh.
                  </p>
                  <div className="h-7 md:h-9"></div>
                  <Link
                    to="/about"
                    className="purple-motion-effect inline-flex items-center justify-center rounded-full px-7 py-3 font-mono text-base leading-tight font-bold"
                    style={
                      {
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#6D3B9F',
                        '--pme-color': '#F4EDEA',
                        '--pme-hover-color': '#201C36',
                        '--pme-wipe-bg': '#F0C2FF',
                      } as React.CSSProperties
                    }
                  >
                    Read More About Us
                  </Link>
                </div>

                <div className="grid gap-4">
                  {impactStats.map((stat, index) => (
                    <RevealSection key={stat.label} delay={200 + index * 150}>
                      <div
                        className="flex items-center gap-6 rounded-2xl px-6 py-6"
                        style={FAQ_CARD_STYLE}
                      >
                        <div
                          className="text-4xl font-bold tracking-tight md:text-5xl"
                          style={{ color: MAUVE }}
                        >
                          {stat.value}
                        </div>
                        <div className="text-base font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </RevealSection>
                  ))}
                </div>
              </div>
            </RevealSection>

            <div className="h-16 md:h-24"></div>

            <RevealSection>
              <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
                <div
                  className="rounded-2xl px-6 py-7 md:px-8"
                  style={FAQ_CARD_STYLE}
                >
                  <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6">
                    {builderProfiles.map(builder => (
                      <div
                        key={builder.name}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#DAD7E2] shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:h-20 md:w-20">
                          {builder.imageSrc ? (
                            <img
                              src={builder.imageSrc}
                              alt={builder.name}
                              className="h-full w-full object-cover object-center"
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F4EDEA] via-[#D9D2E8] to-[#B89BCF]"
                              aria-hidden="true"
                            >
                              <span className="font-mono text-xl font-bold tracking-tight text-[#4A345B] md:text-2xl">
                                {builder.name
                                  .split(' ')
                                  .map(part => part[0])
                                  .slice(0, 2)
                                  .join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 max-w-[10rem]">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: TEXT_PRIMARY }}
                          >
                            {builder.name}
                          </p>
                          <p
                            className="mt-0.5 text-xs leading-4"
                            style={{ color: TEXT_MUTED }}
                          >
                            {builder.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-xl">
                  <h2
                    className="text-3xl font-bold tracking-tight md:text-4xl 2xl:text-5xl"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    Contribute to the Community
                  </h2>
                  <div className="h-5"></div>
                  <p
                    className="text-lg leading-relaxed md:text-xl"
                    style={{ color: TEXT_SECONDARY }}
                  >
                    USAMO Guide is a student-run community dedicated to olympiad
                    mathematics. Join us to write lessons, curate problem sets,
                    and grow as a mentor alongside fellow contest enthusiasts.
                  </p>
                  <div className="h-7 md:h-9"></div>
                  <a
                    href="https://docs.google.com/document/d/1AUNOq6OlVcSZN_gUPfvyhimlh9hA4GNvNaLdzyflX_8/edit?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                    className="purple-motion-effect inline-flex items-center justify-center rounded-full px-7 py-3 font-mono text-base leading-tight font-bold"
                    style={
                      {
                        border: '1px solid rgba(240, 194, 255, 0.34)',
                        background: '#6D3B9F',
                        '--pme-color': '#F4EDEA',
                        '--pme-hover-color': '#201C36',
                        '--pme-wipe-bg': '#F0C2FF',
                      } as React.CSSProperties
                    }
                  >
                    Get Involved
                  </a>
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </div>
      {/* Begin FAQ */}
      <div
        className="relative transition-colors duration-500"
        style={{
          background: PAGE_BG,
          color: TEXT_PRIMARY,
        }}
      >
        <div className="relative z-10 mx-auto max-w-(--breakpoint-xl) px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20 lg:pb-28">
          <RevealSection>
            <h2
              className={sectionHeadingClasses}
              style={{ color: TEXT_PRIMARY }}
            >
              Frequently asked questions
            </h2>
            <p
              className={classNames(sectionSubtitleClasses, 'mt-4')}
              style={{ color: TEXT_SECONDARY }}
            >
              The essentials about the competition path, how the Guide works,
              and how to get involved.
            </p>
          </RevealSection>
          <div className="pt-10 md:pt-16">
            <RevealSection delay={100}>
              <dl className="mx-auto grid max-w-6xl gap-8 text-center md:grid-cols-2 md:gap-8">
                <div>
                  <FaqCard
                    id="amc"
                    question="What are AMC, AIME, and USAMO?"
                    isOpen={openFaqs.amc}
                    onToggle={() => toggleFaq('amc')}
                  >
                    <p
                      className="text-base leading-6"
                      style={{ color: TEXT_SECONDARY }}
                    >
                      These are the three big rungs of the US math competition
                      ladder. AMC 8 is for middle schoolers, AMC 10/12 for high
                      schoolers. While both are 25-question multiple choice
                      contests, score well enough on them and you would qualify
                      for AIME, a much harder 15-question numerical exam. Do
                      well on the AIME aswell and you're at the USAMO (or
                      USAJMO) territory. This would probably be the toughest
                      math test most high schoolers will ever take. For official
                      dates and registration, check the{' '}
                      <a
                        href="https://www.maa.org/math-competitions"
                        target="_blank"
                        rel="noreferrer"
                        style={linkStyle}
                      >
                        MAA competitions page
                      </a>
                      .
                    </p>
                  </FaqCard>
                  <div className="mt-6">
                    <FaqCard
                      id="syllabus"
                      question="Is this an official syllabus?"
                      isOpen={openFaqs.syllabus}
                      onToggle={() => toggleFaq('syllabus')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Nope. USAMO Guide is built by the community, for the
                        community. It's our best attempt at organizing what
                        actually works for AMC/AIME/USAMO prep, not something
                        blessed by the MAA :/ Think of it as notes that are
                        passed down and refined by people who've been through
                        the process, constantly getting better as more people
                        chip in.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="bug"
                      question="I found a bug / typo / confusing explanation, what do I do?"
                      isOpen={openFaqs.bug}
                      onToggle={() => toggleFaq('bug')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Tell us! Hit "Contact Us" at the top of the page, or
                        email{' '}
                        <a
                          href="mailto:contact@usamoguide.com"
                          style={linkStyle}
                        >
                          contact@usamoguide.com
                        </a>
                        . If you're comfortable with GitHub, you can also open
                        an issue directly on our{' '}
                        <a
                          href="https://github.com/usamoguide/usamo-guide"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          GitHub repository
                        </a>{' '}
                        , It's often the fastest way to get something fixed.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="tutoring"
                      question="I want live classes or one-on-one tutoring..."
                      isOpen={openFaqs.tutoring}
                      onToggle={() => toggleFaq('tutoring')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        That's not really what we do.. We're a self-paced
                        resource. For live instruction, AoPS runs solid online
                        classes. If you still want structure and other people
                        around, join one of our study groups or hop into a
                        weekly mock contest for practice under real conditions.
                      </p>
                    </FaqCard>
                  </div>
                </div>
                <div className="mt-6 md:mt-0">
                  <FaqCard
                    id="qualify"
                    question="Do I need to already be good at math / qualified for USAMO to use this?"
                    isOpen={openFaqs.qualify}
                    onToggle={() => toggleFaq('qualify')}
                  >
                    <p
                      className="text-base leading-6"
                      style={{ color: TEXT_SECONDARY }}
                    >
                      Not even close. Start on day one of AMC 8 prep or show up
                      already grinding toward USAMO, either way, there's a place
                      for you here. The material ramps from the basics up to
                      olympiad-level, so you can jump in wherever you actually
                      are.
                    </p>
                  </FaqCard>
                  <div className="mt-6">
                    <FaqCard
                      id="help"
                      question="Where can I get help when I'm stuck?"
                      isOpen={openFaqs.help}
                      onToggle={() => toggleFaq('help')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Our{' '}
                        <a
                          href="https://discord.gg/X2zx6u53XH"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          Discord
                        </a>{' '}
                        is the best place. People are usually around to help
                        with a specific problem or concept. Beyond that, you can
                        join a study group, get paired with a mentor, or just
                        email us if it's a question about the guide itself.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="contribute"
                      question="How can I contribute?"
                      isOpen={openFaqs.contribute}
                      onToggle={() => toggleFaq('contribute')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Please do. Fix a typo, rewrite a confusing explanation,
                        add a problem, improve a diagram, clean up some code -
                        it all helps. Head to our{' '}
                        <a
                          href="https://github.com/usamoguide/usamo-guide"
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                        >
                          GitHub
                        </a>{' '}
                        for contribution guidelines and open issues.
                      </p>
                    </FaqCard>
                  </div>
                  <div className="mt-6">
                    <FaqCard
                      id="source"
                      question="Is this open source?"
                      isOpen={openFaqs.source}
                      onToggle={() => toggleFaq('source')}
                    >
                      <p
                        className="text-base leading-6"
                        style={{ color: TEXT_SECONDARY }}
                      >
                        Yes, all of it! Fork it, build on it, poke around and
                        see how it works. Nothing's hidden. (Attribution
                        required + Commerical use not allowed.)
                      </p>
                    </FaqCard>
                  </div>
                </div>
              </dl>
            </RevealSection>
          </div>
        </div>
      </div>
      {/*End FAQ*/}
      <footer className="relative overflow-hidden bg-[#0F1020] text-[#F4EDEA]">
        <RevealSection className="relative mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-10 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.75fr))] lg:gap-16">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <img
                  src="/images/Test_logo.png"
                  alt="USAMO Guide"
                  className="h-11 w-11 shrink-0 object-cover"
                />
                <span className="text-xl font-semibold tracking-tight text-[#F4EDEA]">
                  USAMO Guide
                </span>
              </div>

              <h2 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-[#F4EDEA] sm:text-5xl">
                Your math contest second home
              </h2>

              <p className="mt-5 max-w-lg text-lg leading-8 text-[#B8B4C5]">
                USAMO Guide brings lessons, resources, problem sets, and
                community support into one place for AMC, AIME, and Olympiad
                prep.
              </p>

              <Link
                to="/foundations"
                className="purple-motion-effect mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 font-mono text-lg leading-tight font-bold md:px-8 md:py-3"
                style={footerButtonStyle}
              >
                Browse topics
              </Link>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">Menu</h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/" style={footerLinkStyle}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/foundations" style={footerLinkStyle}>
                    Learn Foundations
                  </Link>
                </li>
                <li>
                  <Link to="/problems" style={footerLinkStyle}>
                    Problem Sets
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" style={footerLinkStyle}>
                    Progress Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/other-useful-resources" style={footerLinkStyle}>
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">
                Community
              </h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/contact-us" style={footerLinkStyle}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://discord.gg/X2zx6u53XH"
                    target="_blank"
                    rel="noreferrer"
                    style={footerLinkStyle}
                  >
                    Discord Community
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/usamoguide/usamo-guide"
                    target="_blank"
                    rel="noreferrer"
                    style={footerLinkStyle}
                  >
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" style={footerLinkStyle}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" style={footerLinkStyle}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#F4EDEA]">Support</h3>
              <ul className="mt-5 space-y-4 text-base text-[#B8B4C5]">
                <li>
                  <Link to="/contact-us" style={footerLinkStyle}>
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" style={footerLinkStyle}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" style={footerLinkStyle}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" style={footerLinkStyle}>
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-end gap-4 text-sm text-[#8E8AA1]">
            <span>
              &copy; {new Date().getFullYear()} USAMO Guide - All rights
              reserved
            </span>
            <div className="flex items-center gap-2">
              {footerSocialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[#F4EDEA] transition hover:-translate-y-0.5 hover:border-[#F0C2FF]/60 hover:bg-white/5 hover:text-[#F0C2FF]"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </a>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Full-bleed wordmark, with tree canopy behind it and grass overlapping in front */}
        <RevealSection className="pointer-events-none relative left-1/2 mt-4 w-screen -translate-x-1/2 overflow-hidden">
          <img
            src="images/tree-canopy-pink.png"
            alt=""
            className="absolute top-1/2 right-0 z-0 h-[clamp(8rem,22vw,22rem)] w-auto -translate-y-1/2 object-contain select-none"
          />

          <svg
            viewBox="0 0 1200 140"
            preserveAspectRatio="xMidYMax meet"
            className="relative z-10 block h-[clamp(5.5rem,18vw,18rem)] w-full"
          >
            <text
              x="50%"
              y="132"
              textAnchor="middle"
              fontSize="140"
              fontWeight="600"
              letterSpacing="-8"
              fill="#F7F4EC"
              fontFamily="inherit"
            >
              USAMO Guide
            </text>
          </svg>

          <img
            src="images/ground-grass-wide.png"
            alt=""
            className="relative z-20 mt-[clamp(-4rem,-8vw,-1.5rem)] block h-auto w-full select-none"
          />
        </RevealSection>
      </footer>
    </Layout>
  );
}
