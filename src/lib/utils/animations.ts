import { animate, spring, stagger } from 'motion';

// Apple-style easing curves
export const easings = {
  // Apple's signature easing curve
  apple: [0.25, 0.1, 0.25, 1],
  // Smooth entrance
  easeOut: [0, 0, 0.2, 1],
  // Quick exit
  easeIn: [0.4, 0, 1, 1],
  // Balanced
  easeInOut: [0.4, 0, 0.2, 1],
  // Bouncy spring feel
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

// Animation durations following Apple's design guidelines
export const durations = {
  // Micro-interactions (button presses, hover states)
  micro: 0.15,
  // Standard transitions (page changes, modal opens)
  standard: 0.3,
  // Complex animations (layout changes)
  complex: 0.5,
  // Slow, dramatic effects
  dramatic: 0.8,
} as const;

// Spring configurations for different interaction types
export const springs = {
  // Gentle spring for UI elements
  gentle: { stiffness: 300, damping: 30 },
  // Bouncy spring for playful interactions
  bouncy: { stiffness: 400, damping: 25 },
  // Snappy spring for quick feedback
  snappy: { stiffness: 500, damping: 35 },
  // Smooth spring for layout changes
  smooth: { stiffness: 200, damping: 25 },
} as const;

// Stagger configurations for sequential animations
export const staggers = {
  // Quick succession
  fast: 0.05,
  // Standard timing
  standard: 0.1,
  // Slower, more dramatic
  slow: 0.2,
} as const;

// Common animation presets
export const animations = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    options: { duration: durations.standard, ease: easings.easeOut },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    options: { duration: durations.micro, ease: easings.easeIn },
  },

  // Scale animations
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    options: { duration: durations.standard, ease: easings.apple },
  },
  scaleOut: {
    from: { opacity: 1, scale: 1 },
    to: { opacity: 0, scale: 0.95 },
    options: { duration: durations.micro, ease: easings.easeIn },
  },

  // Slide animations
  slideInUp: {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    options: { duration: durations.standard, ease: easings.apple },
  },
  slideInDown: {
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    options: { duration: durations.standard, ease: easings.apple },
  },
  slideInLeft: {
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    options: { duration: durations.standard, ease: easings.apple },
  },
  slideInRight: {
    from: { opacity: 0, x: 20 },
    to: { opacity: 1, x: 0 },
    options: { duration: durations.standard, ease: easings.apple },
  },

  // Button press animation
  buttonPress: {
    from: { scale: 1 },
    to: { scale: 0.98 },
    options: { duration: durations.micro, ease: easings.easeOut },
  },
  buttonRelease: {
    from: { scale: 0.98 },
    to: { scale: 1 },
    options: { duration: durations.micro, ease: easings.easeOut },
  },

  // Card hover animations
  cardHover: {
    from: { y: 0, scale: 1 },
    to: { y: -2, scale: 1.02 },
    options: { duration: durations.standard, ease: easings.apple },
  },
  cardLeave: {
    from: { y: -2, scale: 1.02 },
    to: { y: 0, scale: 1 },
    options: { duration: durations.standard, ease: easings.apple },
  },

  // Loading animations
  pulse: {
    from: { opacity: 0.5 },
    to: { opacity: 1 },
    options: { 
      duration: durations.standard, 
      ease: easings.easeInOut,
      direction: 'alternate',
      repeat: Infinity,
    },
  },
} as const;

// Animation utility functions
export const animationUtils = {
  // Animate element with preset
  async animatePreset(element: Element | string, preset: keyof typeof animations) {
    const animation = animations[preset];
    return animate(element, animation.to, animation.options);
  },

  // Animate with spring
  async animateSpring(
    element: Element | string, 
    to: Record<string, any>, 
    springType: keyof typeof springs = 'gentle'
  ) {
    return animate(element, to, {
      type: spring,
      ...springs[springType],
    });
  },

  // Stagger animation for multiple elements
  async staggerElements(
    elements: Element[] | string, 
    to: Record<string, any>,
    staggerType: keyof typeof staggers = 'standard',
    options: Record<string, any> = {}
  ) {
    return animate(
      elements,
      to,
      {
        delay: stagger(staggers[staggerType]),
        duration: durations.standard,
        ease: easings.apple,
        ...options,
      }
    );
  },

  // Page transition animation
  async pageTransition(element: Element | string, direction: 'in' | 'out' = 'in') {
    if (direction === 'in') {
      return animate(element, animations.slideInUp.to, {
        ...animations.slideInUp.options,
        delay: 0.1,
      });
    } else {
      return animate(element, animations.fadeOut.to, animations.fadeOut.options);
    }
  },

  // Focus animation for inputs
  async focusAnimation(element: Element | string) {
    return animate(element, 
      { 
        scale: 1.02,
        boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.1)',
      }, 
      {
        duration: durations.micro,
        ease: easings.easeOut,
      }
    );
  },

  // Blur animation for inputs
  async blurAnimation(element: Element | string) {
    return animate(element, 
      { 
        scale: 1,
        boxShadow: '0 0 0 0px rgba(0, 122, 255, 0)',
      }, 
      {
        duration: durations.micro,
        ease: easings.easeIn,
      }
    );
  },

  // Loading state animation
  async loadingAnimation(element: Element | string) {
    return animate(element, 
      { 
        opacity: [1, 0.5, 1],
      }, 
      {
        duration: durations.dramatic,
        ease: easings.easeInOut,
        repeat: Infinity,
      }
    );
  },

  // Success feedback animation
  async successAnimation(element: Element | string) {
    return animate(element, 
      { 
        scale: [1, 1.05, 1],
        backgroundColor: ['#007aff', '#30d158', '#007aff'],
      }, 
      {
        duration: durations.complex,
        ease: easings.apple,
      }
    );
  },

  // Error feedback animation
  async errorAnimation(element: Element | string) {
    return animate(element, 
      { 
        x: [0, -5, 5, -5, 5, 0],
        backgroundColor: ['#007aff', '#ff3b30', '#007aff'],
      }, 
      {
        duration: durations.complex,
        ease: easings.easeOut,
      }
    );
  },
};

// Intersection Observer for scroll-triggered animations
export function createScrollAnimation(
  element: Element,
  animation: keyof typeof animations,
  options: IntersectionObserverInit = {}
) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animationUtils.animatePreset(entry.target, animation);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options,
    }
  );

  observer.observe(element);
  return observer;
}

// Cleanup function for animations
export function cleanupAnimations() {
  // Motion One automatically handles cleanup, but this can be extended
  // for custom cleanup logic if needed
}
