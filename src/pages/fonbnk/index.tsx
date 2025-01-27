import { useRouter } from "next/router";
import IframeComponent from "./iframe";

export default function Fonbnk() {
   const router = useRouter()

    const handleGoBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back(); // Navigates to the previous page
        } else {
          router.push("/"); // Fallback: Redirects to the homepage
        }
      };
  return (
    <section className="ifrmae py-3 position-relative">
        <div className="container">
            <div className="grid gap-3 grid-cols-12">
                <div className="col-span-12">
                <div className="sectionHeader pb-2 border-bottom border-secondary mb-4">
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={handleGoBack}
                    className="border-0 themeClr p-0"
                  >
                    {backIcn}
                  </button>
                  <h4 className="m-0 text-2xl font-bold">My Page</h4>
                </div>
              </div>
                </div>
            </div>
        </div>
      <IframeComponent />
    </section>
  );
}
const backIcn = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M22 20.418C19.5533 17.4313 17.3807 15.7367 15.482 15.334C13.5833 14.9313 11.7757 14.8705 10.059 15.1515V20.5L2 11.7725L10.059 3.5V8.5835C13.2333 8.6085 15.932 9.74733 18.155 12C20.3777 14.2527 21.6593 17.0587 22 20.418Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  );
  