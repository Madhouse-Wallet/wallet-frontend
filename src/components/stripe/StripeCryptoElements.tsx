import React, { ReactNode, useContext, useEffect, useRef, useState } from 'react';

// Define the context value type
interface CryptoElementsContextValue {
  onramp: any | null;
}

// ReactContext to simplify access to StripeOnramp object
const CryptoElementsContext = React.createContext<CryptoElementsContextValue | null>(null);
CryptoElementsContext.displayName = 'CryptoElementsContext';

interface CryptoElementsProps {
  stripeOnramp: Promise<any> | null;
  children: ReactNode;
}

export const CryptoElements: React.FC<CryptoElementsProps> = ({ stripeOnramp, children }) => {
  const [ctx, setContext] = useState<CryptoElementsContextValue>({ onramp: null });

  useEffect(() => {
    let isMounted = true;

    Promise.resolve(stripeOnramp).then((onramp) => {
      if (onramp && isMounted) {
        setContext((prevCtx) => (prevCtx.onramp ? prevCtx : { onramp }));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripeOnramp]);

  return <CryptoElementsContext.Provider value={ctx}>{children}</CryptoElementsContext.Provider>;
};

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
  const context = useContext(CryptoElementsContext);
  if (!context) {
    throw new Error('useStripeOnramp must be used within a CryptoElements provider');
  }
  return context.onramp;
};

// Helper hook for session listeners
const useOnrampSessionListener = (
  type: string,
  session: any,
  callback?: (payload: any) => void
) => {
  useEffect(() => {
    if (session && callback) {
      const listener = (e: any) => callback(e.payload);
      session.addEventListener(type, listener);
      return () => {
        session.removeEventListener(type, listener);
      };
    }
    return () => {};
  }, [session, callback, type]);
};

interface OnrampElementProps extends React.HTMLAttributes<HTMLDivElement> {
  clientSecret: string;
  appearance?: Record<string, any>;
  onReady?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export const OnrampElement: React.FC<OnrampElementProps> = ({
  clientSecret,
  appearance,
  onReady,
  onChange,
  ...props
}) => {
  const stripeOnramp = useStripeOnramp();
  const onrampElementRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<any | null>(null);

  const appearanceJSON = JSON.stringify(appearance);
  useEffect(() => {
    const containerRef = onrampElementRef.current;
    if (containerRef) {
      // Clear the container for remounting
      containerRef.innerHTML = '';

      if (clientSecret && stripeOnramp) {
        const newSession = stripeOnramp.createSession({
          clientSecret,
          appearance: appearanceJSON ? JSON.parse(appearanceJSON) : {},
        });
        newSession.mount(containerRef);
        setSession(newSession);
      }
    }
  }, [appearanceJSON, clientSecret, stripeOnramp]);

  useOnrampSessionListener('onramp_ui_loaded', session, onReady);
  useOnrampSessionListener('onramp_session_updated', session, onChange);

  return <div {...props} ref={onrampElementRef}></div>;
};
