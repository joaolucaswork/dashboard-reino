import { animationUtils, animations, createScrollAnimation } from '$lib/utils/animations';
import type { Action } from 'svelte/action';

// Types for animation actions
interface AnimateOptions {
  preset?: keyof typeof animations;
  trigger?: 'immediate' | 'hover' | 'focus' | 'scroll' | 'click';
  delay?: number;
  spring?: 'gentle' | 'bouncy' | 'snappy' | 'smooth';
  custom?: {
    to: Record<string, any>;
    options?: Record<string, any>;
  };
}

interface StaggerOptions {
  preset?: keyof typeof animations;
  staggerType?: 'fast' | 'standard' | 'slow';
  delay?: number;
  selector?: string;
}

interface HoverOptions {
  scale?: number;
  y?: number;
  duration?: number;
  ease?: string;
}

// Main animation action
export const animate: Action<Element, AnimateOptions> = (element, options = {}) => {
  const {
    preset = 'fadeIn',
    trigger = 'immediate',
    delay = 0,
    spring,
    custom
  } = options;

  let cleanup: (() => void) | null = null;
  let observer: IntersectionObserver | null = null;

  const performAnimation = async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    if (custom) {
      if (spring) {
        return animationUtils.animateSpring(element, custom.to, spring);
      } else {
        return animationUtils.animatePreset(element, preset);
      }
    } else if (spring) {
      const animation = animations[preset];
      return animationUtils.animateSpring(element, animation.to, spring);
    } else {
      return animationUtils.animatePreset(element, preset);
    }
  };

  const setupTrigger = () => {
    switch (trigger) {
      case 'immediate':
        performAnimation();
        break;

      case 'scroll':
        observer = createScrollAnimation(element, preset);
        cleanup = () => observer?.disconnect();
        break;

      case 'hover':
        const handleMouseEnter = () => performAnimation();
        element.addEventListener('mouseenter', handleMouseEnter);
        cleanup = () => element.removeEventListener('mouseenter', handleMouseEnter);
        break;

      case 'focus':
        const handleFocus = () => performAnimation();
        element.addEventListener('focus', handleFocus);
        cleanup = () => element.removeEventListener('focus', handleFocus);
        break;

      case 'click':
        const handleClick = () => performAnimation();
        element.addEventListener('click', handleClick);
        cleanup = () => element.removeEventListener('click', handleClick);
        break;
    }
  };

  setupTrigger();

  return {
    update(newOptions: AnimateOptions) {
      cleanup?.();
      Object.assign(options, newOptions);
      setupTrigger();
    },
    destroy() {
      cleanup?.();
      observer?.disconnect();
    }
  };
};

// Stagger animation action for child elements
export const stagger: Action<Element, StaggerOptions> = (element, options = {}) => {
  const {
    preset = 'slideInUp',
    staggerType = 'standard',
    delay = 0,
    selector = '> *'
  } = options;

  let observer: IntersectionObserver | null = null;

  const performStagger = async () => {
    const children = element.querySelectorAll(selector);
    if (children.length === 0) return;

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    const animation = animations[preset];
    return animationUtils.staggerElements(
      Array.from(children),
      animation.to,
      staggerType,
      animation.options
    );
  };

  // Use intersection observer for scroll-triggered stagger
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          performStagger();
          observer?.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  observer.observe(element);

  return {
    update(newOptions: StaggerOptions) {
      Object.assign(options, newOptions);
    },
    destroy() {
      observer?.disconnect();
    }
  };
};

// Hover animation action
export const hover: Action<Element, HoverOptions> = (element, options = {}) => {
  const {
    scale = 1.02,
    y = -2,
    duration = 0.3,
    ease = 'apple'
  } = options;

  const handleMouseEnter = () => {
    animationUtils.animateSpring(element, {
      scale,
      y,
    }, 'gentle');
  };

  const handleMouseLeave = () => {
    animationUtils.animateSpring(element, {
      scale: 1,
      y: 0,
    }, 'gentle');
  };

  element.addEventListener('mouseenter', handleMouseEnter);
  element.addEventListener('mouseleave', handleMouseLeave);

  return {
    update(newOptions: HoverOptions) {
      Object.assign(options, newOptions);
    },
    destroy() {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    }
  };
};

// Button press animation action
export const buttonPress: Action<Element> = (element) => {
  const handleMouseDown = () => {
    animationUtils.animatePreset(element, 'buttonPress');
  };

  const handleMouseUp = () => {
    animationUtils.animatePreset(element, 'buttonRelease');
  };

  const handleMouseLeave = () => {
    animationUtils.animatePreset(element, 'buttonRelease');
  };

  element.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('mouseup', handleMouseUp);
  element.addEventListener('mouseleave', handleMouseLeave);

  return {
    destroy() {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
    }
  };
};

// Focus animation action for inputs
export const focusAnimation: Action<Element> = (element) => {
  const handleFocus = () => {
    animationUtils.focusAnimation(element);
  };

  const handleBlur = () => {
    animationUtils.blurAnimation(element);
  };

  element.addEventListener('focus', handleFocus);
  element.addEventListener('blur', handleBlur);

  return {
    destroy() {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    }
  };
};

// Page transition action
export const pageTransition: Action<Element> = (element) => {
  // Animate in on mount
  animationUtils.pageTransition(element, 'in');

  return {
    destroy() {
      // Animate out on unmount if needed
      animationUtils.pageTransition(element, 'out');
    }
  };
};

// Loading animation action
export const loading: Action<Element, boolean> = (element, isLoading = false) => {
  let animation: any = null;

  const updateLoading = (loading: boolean) => {
    if (loading && !animation) {
      animation = animationUtils.loadingAnimation(element);
    } else if (!loading && animation) {
      animation.stop?.();
      animation = null;
      // Reset to normal state
      animationUtils.animatePreset(element, 'fadeIn');
    }
  };

  updateLoading(isLoading);

  return {
    update(newIsLoading: boolean) {
      updateLoading(newIsLoading);
    },
    destroy() {
      animation?.stop?.();
    }
  };
};

// Success/Error feedback actions
export const feedback: Action<Element, 'success' | 'error' | null> = (element, type = null) => {
  const performFeedback = (feedbackType: 'success' | 'error' | null) => {
    if (feedbackType === 'success') {
      animationUtils.successAnimation(element);
    } else if (feedbackType === 'error') {
      animationUtils.errorAnimation(element);
    }
  };

  if (type) {
    performFeedback(type);
  }

  return {
    update(newType: 'success' | 'error' | null) {
      if (newType) {
        performFeedback(newType);
      }
    },
    destroy() {
      // Cleanup if needed
    }
  };
};
