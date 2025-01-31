import { useRouter } from 'next/router'
import React from 'react'
// src/pages/sphere/page.tsx
import SphereRampWidget from '@/components/SphereWidget/SphereRampWidget';
import Wlogomw from "@/Assets/Images/logow.png";
import styled from 'styled-components';

function Spharepay() {
    const router = useRouter()
    const theme = {
        color: 'gray' as const,
        radius: 'lg' as const,
        components: {
            logo: `./favicn.png` // Add your logo to the public folder
        }
    };

    return (
        <>
            <section className="ifrmae pt-12 relative">
                <div className="container">
                    <div
                        className="pageCard relative pb-3 px-3 lg:p-6 lg:pt-0  mx-auto w-full fixed bg-[#000] contrast-more:bg-black  
           transition-[opacity,transform] ease-out 
          h-[calc(100dvh-var(--sheet-top))] max-w-[1320px] md:w-[calc(100vw-50px)] lg:h-[calc(100dvh-60px)] lg:w-[calc(100vw-120px)]"
                    >
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="border-0 p-0  z-[99] absolute top-2 right-2 opacity-40  text-white hover:opacity-70"
                            style={{ background: "transparent" }}
                        >
                            {closeIcn}
                        </button>
                        <div className="grid gap-3 grid-cols-12">
                            <div className=" col-span-12 sticky top-0 z-10">
                                <div className="sectionHeader bg-[#000] py-4 contrast-more:bg-black border-b border-gray-900 flex items-start justify-between">

                                    <div className="d-flex align-items-center gap-3 pb-3">
                                        <h4 className="m-0 text-24 font-bold -tracking-3 text-white/75 md:text-4xl flex-1 whitespace-nowrap capitalize leading-none">
                                            Spherepay
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12">
                                <Wrpper>

                                    <SphereRampWidget
                                        applicationId={process.env.NEXT_PUBLIC_SPHERE_APP_ID || ''}
                                        // debug={process.env.NODE_ENV === 'development'}
                                        debug={false}
                                        theme={theme}
                                    />
                                </Wrpper>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

const Wrpper = styled.div`
position: relative;
div#sphere-ramp-container
{
    .ramp-w-dvw {
        width: 100%;
} 
}
`

export default Spharepay
const closeIcn = (
    <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 24 24"
        height="24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z"></path>
    </svg>
);