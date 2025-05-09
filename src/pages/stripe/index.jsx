import StripePaymentPageETH from "../stripePaymentPageETH";
import { BackBtn } from "@/components/common";

export default function Identity() {
  return (
    <>
      <section className="pt-12 realtive identity">
        <div className="container relative">
          <div className="pageCard bg-black/2 contrast-more:bg-dialog-content shadow-dialog backdrop-blur-3xl contrast-more:backdrop-blur-none duration-200 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]">
            <div className="grid gap-3 grid-cols-12">
              <div className=" col-span-12  z-10">
                <div
                  className={` sectionHeader  px-3 py-4 contrast-more:bg-black border-b border-gray-900`}
                >
                  <div className="flex align-items-center gap-3 pb-3">
                    <BackBtn />
                    <h4 className="m-0 text-[18px] sm:text-[20px] font-bold -tracking-3 md:text-3xl flex-1 whitespace-nowrap capitalize leading-none">
                      Stripe Payment
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-span-12 pt-8">
                <StripePaymentPageETH />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
