import { useState, useEffect } from "react";

const useInputMethod = () => {
  const [inputMethod, setInputMethod] = useState("Unknown");
  const [lastInputMethod, setLastInputMethod] = useState(null);
  const [isVirtualKeyboard, setIsVirtualKeyboard] = useState(false);
  const [deviceType, setDeviceType] = useState("Unknown");

  useEffect(() => {
    let lastInputTime = 0;
    let lastKeyWasComposition = false;
    const keyEventSources = new Set();

    // Detect device type based on various factors
    const detectDeviceType = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|iphone|ipad|android/.test(ua);
      const isTablet = /ipad|android/.test(ua) && !/mobile/.test(ua);
      const isIPad = navigator.maxTouchPoints > 1 && /macintosh/.test(ua);
      
      if (isIPad || isTablet) {
        return "Tablet";
      } else if (isMobile) {
        return "Mobile";
      } else {
        return "Desktop";
      }
    };

    // Check if device supports touch
    const isTouchDevice = () => {
      return (
        navigator.maxTouchPoints > 0 ||
        'ontouchstart' in window ||
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
      );
    };

    // Check if device is a convertible/tablet PC
    const isConvertibleDevice = () => {
      const ua = navigator.userAgent;
      return (
        navigator.maxTouchPoints > 0 &&
        /Windows/.test(ua) &&
        (/Touch/.test(ua) || /Tablet PC/.test(ua) || /convertible/i.test(ua))
      );
    };

    // Check if device is in tablet mode
    const isTabletMode = () => {
      try {
        return (
          window.matchMedia('(-ms-system-state: tablet)').matches ||
          window.matchMedia('(tablet-mode: active)').matches ||
          (detectDeviceType() !== "Desktop" && isTouchDevice())
        );
      } catch (e) {
        return false;
      }
    };

    // Check for physical keyboard characteristics
    const hasPhysicalKeyboardCharacteristics = (e) => {
      const device = detectDeviceType();
      
      // For mobile/tablet devices, physical keyboard needs stronger verification
      if (device === "Mobile" || device === "Tablet") {
        return (
          e.isTrusted &&
          !e.sourceCapabilities?.firesTouchEvents &&
          (e.ctrlKey || e.altKey || e.metaKey) && // Modifier keys indicate physical keyboard
          !lastKeyWasComposition &&
          e.keyCode !== 229
        );
      }

      // For desktop, we're more lenient
      return (
        e.isTrusted &&
        !e.sourceCapabilities?.firesTouchEvents &&
        e.keyCode !== 229 &&
        !lastKeyWasComposition &&
        (
          e.ctrlKey ||
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

    // Check for virtual keyboard characteristics
    const hasVirtualKeyboardCharacteristics = (e) => {
      if (hasPhysicalKeyboardCharacteristics(e)) {
        return false;
      }

      const device = detectDeviceType();
      const virtualCharacteristics = [
        e.keyCode === 229, // IME composition
        !e.isTrusted, // Synthetic event
        e.sourceCapabilities?.firesTouchEvents, // Touch-based input
        lastKeyWasComposition, // Part of IME composition
        device !== "Desktop" && isTouchDevice(), // Non-desktop touch device
        keyEventSources.size > 1 // Mixed input sources
      ];

      // For mobile/tablet, we're more lenient in detecting virtual keyboards
      if (device === "Mobile" || device === "Tablet") {
        return virtualCharacteristics.filter(Boolean).length >= 1;
      }

      // For desktop, we need more confidence
      return virtualCharacteristics.filter(Boolean).length >= 2;
    };

    const handleCompositionStart = () => {
      lastKeyWasComposition = true;
    };

    const handleCompositionEnd = () => {
      lastKeyWasComposition = false;
    };

    const handleKeyboardInput = (e) => {
      const currentTime = Date.now();
      const timeSinceLastInput = currentTime - lastInputTime;
      lastInputTime = currentTime;

      keyEventSources.add(e.sourceCapabilities?.firesTouchEvents);
      const device = detectDeviceType();

      // Handle physical keyboard
      if (hasPhysicalKeyboardCharacteristics(e)) {
        setInputMethod("Physical Keyboard");
        setLastInputMethod("Keyboard");
        setIsVirtualKeyboard(false);
        return;
      }

      // Handle virtual keyboard
      if (
        hasVirtualKeyboardCharacteristics(e) ||
        (device !== "Desktop" && timeSinceLastInput < 50) // Fast typing on mobile/tablet likely means virtual
      ) {
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
        setIsVirtualKeyboard(true);
        return;
      }

      // Default to physical keyboard if we're unsure
      setInputMethod("Physical Keyboard");
      setLastInputMethod("Keyboard");
      setIsVirtualKeyboard(false);
    };

    const handleTouchInput = (e) => {
      lastInputTime = Date.now();
      const device = detectDeviceType();
      
      if (device !== "Desktop") {
        setInputMethod("Virtual Keyboard");
        setIsVirtualKeyboard(true);
      } else {
        setInputMethod("Touchscreen");
      }
      setLastInputMethod("Touchscreen");
    };

    const handlePointerInput = (event) => {
      lastInputTime = Date.now();
      const device = detectDeviceType();

      if (event.pointerType === "touch") {
        if (device !== "Desktop") {
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
      keyEventSources.clear();
      const device = detectDeviceType();
      
      if (device !== "Desktop" && isTouchDevice()) {
        setIsVirtualKeyboard(true);
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement?.tagName?.match(/input|textarea/i)) {
          setIsVirtualKeyboard(false);
        }
      }, 500);
    };

    // Initial detection
    const detectInitialState = () => {
      const device = detectDeviceType();
      setDeviceType(device);
      
      if (device !== "Desktop" && isTouchDevice()) {
        setInputMethod("Virtual Keyboard");
        setLastInputMethod("Touchscreen");
        setIsVirtualKeyboard(true);
      } else if (isTouchDevice()) {
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
    detectInitialState();

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

  return { inputMethod, lastInputMethod, deviceType };
};

export default useInputMethod;
