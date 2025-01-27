import { useState } from 'react';

const IframeComponent = () => {
  const [showIframe, setShowIframe] = useState(false);
  const [showIframe1, setShowIframe1] = useState(false);

  return (
    <>
    <div className="p-4">
      <button 
        onClick={() => setShowIframe(true)}
        className="mb-4 flex items-center justify-center btn commonBtn"
      >
        Open Fonbnk Onramp
      </button>

      {showIframe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl h-3/4 rounded-lg p-4">
            <button
              onClick={() => setShowIframe(false)}
              className="absolute right-2 top-2"
            //   variant="outline"
            >
              Close
            </button>
            
            <iframe
            
              src="https://sandbox-pay.fonbnk.com/?source=x9REDkaz"
              className="w-full h-full border-0 rounded"
              title="Fonbnk Payment"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
    <div className="p-4">
      <button 
        onClick={() => setShowIframe1(true)}
        className="mb-4 flex items-center justify-center btn commonBtn"
      >
        Open Fonbnk Offramp
      </button>

      {showIframe1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl h-3/4 rounded-lg p-4">
            <button
              onClick={() => setShowIframe1(false)}
              className="absolute right-2 top-2"
            //   variant="outline"
            >
              Close
            </button>
            
            <iframe
            
              src="https://sandbox-pay.fonbnk.com/offramp/?source=x9REDkaz"
              className="w-full h-full border-0 rounded"
              title="Fonbnk Payment"
              allow="payment"
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default IframeComponent;