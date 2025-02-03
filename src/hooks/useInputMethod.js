import { useState, useEffect } from "react";

const useInputMethod = () => {
  const [inputMethod, setInputMethod] = useState("Unknown");
  const [lastInputMethod, setLastInputMethod] = useState(null);
  const [isVirtualKeyboard, setIsVirtualKeyboard] = useState(false);

  useEffect(() => {
    let lastInputTime = 0;
    let focusTimestamp = 0;
    let lastKeyWasComposition = false;
    const keyEventSources = new Set();
    let consecutiveVirtualKeys = 0;
    const VIRTUAL_KEY_THRESHOLD = 3;

    // Check if device supports touch
    const isTouchDevice = () => {
      return (
        navigator.maxTouchPoints > 0 ||
        'ontouchstart' in window ||
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
      );
    };

    // Check if device is a convertible/tablet
    const isConvertibleDevice = () => {
      return (
        navigator.maxTouchPoints > 0 &&
        /Windows/.test(navigator.userAgent) &&
        (
          /Touch/.test(navigator.userAgent) ||
          /Tablet PC/.test(navigator.userAgent) ||
          /convertible/i.test(navigator.userAgent)
        )
      );
    };

    const isTabletMode = () => {
      try {
        return window.matchMedia('(-ms-system-state: tablet)').matches ||
               window.matchMedia('(tablet-mode: active)').matches;
      } catch (e) {
        return false;
      }
    };

    // Check for physical keyboard characteristics
    const hasPhysicalKeyboardCharacteristics = (e) => {
      // Physical keyboards typically have these characteristics
      return (
        e.isTrusted && // Event is trusted
        !e.sourceCapabilities?.firesTouchEvents && // Not from touch input
        e.keyCode !== 229 && // Not IME composition
        !lastKeyWasComposition && // Not part of composition
        (
          e.ctrlKey || // Modifier keys are common on physical keyboards
          e.altKey ||
          e.metaKey ||
          e.key === 'Tab' ||
          e.key === 'CapsLock' ||
          e.key === 'Shift' ||
          e.key === 'Control' ||
          e.key === 'Alt' ||
          e.key === 'Meta' ||
          e.key === 'Enter' ||
          e.key === 'Backspace'
        )
      );
    };

    // Check characteristics of virtual keyboard input
    const hasVirtualKeyboardCharacteristics = (e) => {
      if (hasPhysicalKeyboardCharacteristics(e)) {
        return false;
      }

      // Virtual keyboards often have these characteristics
      const virtualCharacteristics = [
        e.keyCode === 229, // IME composition
        !e.isTrusted, // Synthetic event
        e.sourceCapabilities?.firesTouchEvents, // Touch-based input
        lastKeyWasComposition, // Part of IME composition
        (e.timeStamp - lastInputTime < 20 && isTouchDevice()), // Very fast typing on touch device
        keyEventSources.size > 1 // Mixed input sources
      ];

      // Count how many virtual characteristics are present
      const virtualScore = virtualCharacteristics.filter(Boolean).length;
      return virtualScore >= 2; // If 2 or more characteristics match, likely virtual
    };

    const handleCompositionStart = () => {
      lastKeyWasComposition = true;
    };

    const handleCompositionEnd = () => {
      lastKeyWasComposition = false;
    };

    const handleKeyboardInput = (e) => {
      const timeSinceLastInput = Date.now() - lastInputTime;
      lastInputTime = Date.now();

      // Store information about this key event
      keyEventSources.add(e.sourceCapabilities?.firesTouchEvents);

      // If it's clearly a physical keyboard, reset virtual keyboard state
      if (hasPhysicalKeyboardCharacteristics(e)) {
        consecutiveVirtualKeys = 0;
        setIsVirtualKeyboard(false);
        setInputMethod("Physical Keyboard");
        setLastInputMethod("Keyboard");
        return;
      }

      // Check for virtual keyboard characteristics
      if (hasVirtualKeyboardCharacteristics(e)) {
        consecutiveVirtualKeys++;
      } else {
        consecutiveVirtualKeys = Math.max(0, consecutiveVirtualKeys - 1);
      }

      // Only set as virtual keyboard if we're very confident
      const isVirtual = 
        (consecutiveVirtualKeys >= VIRTUAL_KEY_THRESHOLD) ||
        (isTabletMode() && isTouchDevice()) ||
        (lastKeyWasComposition && e.keyCode === 229);

      if (isVirtual) {
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
        setIsVirtualKeyboard(true);
      } else {
        setInputMethod("Physical Keyboard");
        setLastInputMethod("Keyboard");
        setIsVirtualKeyboard(false);
      }
    };

    const handleTouchInput = () => {
      lastInputTime = Date.now();
      
      if (isTabletMode()) {
        setInputMethod("Virtual Keyboard");
        setIsVirtualKeyboard(true);
      } else {
        setInputMethod("Touchscreen");
      }
      setLastInputMethod("Touchscreen");
    };

    const handlePointerInput = (event) => {
      lastInputTime = Date.now();

      if (event.pointerType === "touch") {
        if (isTabletMode()) {
          setInputMethod("Virtual Keyboard");
          setIsVirtualKeyboard(true);
        } else {
          setInputMethod("Touchscreen");
        }
        setLastInputMethod("Touchscreen");
      } else if (event.pointerType === "mouse") {
        setInputMethod("Mouse");
        setLastInputMethod("Keyboard");
      } else if (event.pointerType === "pen") {
        setInputMethod("Stylus");
        setLastInputMethod("Touchscreen");
      }
    };

    const handleFocus = () => {
      focusTimestamp = Date.now();
      keyEventSources.clear();
      consecutiveVirtualKeys = 0;
      
      // Only set virtual keyboard if explicitly in tablet mode
      if (isConvertibleDevice() && isTabletMode()) {
        setIsVirtualKeyboard(true);
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement?.tagName?.match(/input|textarea/i)) {
          setIsVirtualKeyboard(false);
          consecutiveVirtualKeys = 0;
        }
      }, 500);
    };

    // Initial detection
    const detectDevice = () => {
      const isTouch = isTouchDevice();
      const isConvertible = isConvertibleDevice();
      
      if (isConvertible && isTabletMode()) {
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
        setIsVirtualKeyboard(true);
      } else if (isTouch) {
        setInputMethod("Touchscreen");
        setLastInputMethod("Touchscreen");
      } else {
        setInputMethod("Physical Keyboard");
        setLastInputMethod("Keyboard");
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyboardInput);
    window.addEventListener("touchstart", handleTouchInput);
    window.addEventListener("pointerdown", handlePointerInput);
    document.addEventListener("focus", handleFocus, true);
    document.addEventListener("blur", handleBlur, true);
    document.addEventListener("compositionstart", handleCompositionStart);
    document.addEventListener("compositionend", handleCompositionEnd);

    // Initial detection
    detectDevice();

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyboardInput);
      window.removeEventListener("touchstart", handleTouchInput);
      window.removeEventListener("pointerdown", handlePointerInput);
      document.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("blur", handleBlur, true);
      document.removeEventListener("compositionstart", handleCompositionStart);
      document.removeEventListener("compositionend", handleCompositionEnd);
    };
  }, [isVirtualKeyboard]);

  return { inputMethod, lastInputMethod };
};

export default useInputMethod;
