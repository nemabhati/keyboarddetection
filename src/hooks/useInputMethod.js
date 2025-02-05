import { useState, useEffect } from "react";

const useInputMethod = () => {
  const [inputMethod, setInputMethod] = useState("Unknown");
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const detectKeyboardType = (e) => {
      setHasInteracted(true);

      // 1. Check for virtual keyboard using viewport changes
      if (window.visualViewport?.height < window.innerHeight) {
        return "Virtual Keyboard";
      }

      // 2. Check for physical keyboard indicators
      const physicalKeyboardSigns = {
        // Hardware modifier keys
        hasModifierKeys: [
          'Fn', 'FnLock',
          'Control', 'Alt', 'Meta', 'OS', 'AltGraph',
          'NumLock', 'ScrollLock', 'CapsLock',
          'Symbol', 'SymbolLock',
          'Hyper', 'Super'
        ].some(mod => e.getModifierState(mod)),

        // Function and special keys
        hasSpecialKeys:
          e.key === 'Tab' ||
          e.key === 'Escape' ||
          /^F\d{1,2}$/.test(e.key) || // F1-F12 keys
          e.code?.startsWith('Numpad') ||
          ['PrintScreen', 'Pause', 'Insert', 'PageUp', 'PageDown', 'End', 'Home', 'ContextMenu'].includes(e.key),

        // Location-based detection (physical keyboards send location info)
        hasKeyLocation: e.location > 0,

        // Trusted events (virtual keyboards might not set this)
        isTrustedEvent: e.isTrusted,

        // Check for IME composition (often used with physical keyboards)
        hasIME: e.isComposing
      };

      // If any physical keyboard indicators are present
      if (Object.values(physicalKeyboardSigns).some(Boolean)) {
        return "Physical Keyboard";
      }

      // 3. Check input type characteristics
      const inputCharacteristics = {
        // Physical keyboards support hover
        hasHover: matchMedia('(hover: hover)').matches,
        // Physical keyboards use fine pointer
        hasFinePointer: matchMedia('(pointer: fine)').matches,
        // Check if device primarily uses touch
        isTouch: 'ontouchstart' in window
      };

      // Default to physical keyboard if we have keyboard-like characteristics
      if (inputCharacteristics.hasHover && 
          inputCharacteristics.hasFinePointer && 
          !inputCharacteristics.isTouch) {
        return "Physical Keyboard";
      }

      // Default to virtual if we can't definitively say it's physical
      return "Virtual Keyboard";
    };

    const handleKeyboardInput = (e) => {
      const keyboardType = detectKeyboardType(e);
      setInputMethod(keyboardType);
    };

    const handleTouchInput = (e) => {
      setHasInteracted(true);
      if (e instanceof TouchEvent) {
        const touch = e.changedTouches[0];
        if (touch?.touchType === 'stylus') {
          setInputMethod("Stylus");
        } else {
          setInputMethod("Virtual Keyboard");
        }
      }
    };

    const handlePointerInput = (e) => {
      setHasInteracted(true);
      if (e instanceof PointerEvent) {
        switch(e.pointerType) {
          case "touch":
            setInputMethod("Virtual Keyboard");
            break;
          case "mouse":
            // Don't change to physical keyboard on mouse movement if we're sure it's virtual
            if (inputMethod !== "Virtual Keyboard") {
              setInputMethod("Physical Keyboard");
            }
            break;
          case "pen":
            setInputMethod("Stylus");
            break;
        }
      }
    };

    const handleVirtualKeyboardChange = () => {
      setHasInteracted(true);
      // @ts-ignore
      if (navigator.virtualKeyboard?.boundingRect.height > 0) {
        setInputMethod("Virtual Keyboard");
      }
    };

    // Add event listeners
    const options = { passive: true };
    window.addEventListener("keydown", handleKeyboardInput, options);
    window.addEventListener("touchstart", handleTouchInput, options);
    window.addEventListener("pointerdown", handlePointerInput, options);

    // Watch for virtual keyboard changes
    if ('virtualKeyboard' in navigator) {
      // @ts-ignore - New API, TypeScript doesn't recognize it yet
      navigator.virtualKeyboard.addEventListener('geometrychange', handleVirtualKeyboardChange);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyboardInput, options);
      window.removeEventListener("touchstart", handleTouchInput, options);
      window.removeEventListener("pointerdown", handlePointerInput, options);
      if ('virtualKeyboard' in navigator) {
        // @ts-ignore
        navigator.virtualKeyboard.removeEventListener('geometrychange', handleVirtualKeyboardChange);
      }
    };
  }, [inputMethod]); // Add inputMethod to dependencies

  return {
    inputMethod: hasInteracted ? inputMethod : "Unknown",
    hasInteracted,
    isPhysicalKeyboard: () => inputMethod === "Physical Keyboard",
    isVirtualKeyboard: () => inputMethod === "Virtual Keyboard",
    isStylus: () => inputMethod === "Stylus"
  };
};

export default useInputMethod;
