import { useRouter } from "next/router";
import React from "react";

const PrivacyPolicy = () => {
  const router = useRouter();
  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Navigates to the previous page
    } else {
      router.push("/"); // Fallback: Redirects to the homepage
    }
  };
  return (
    <>
      <section className="contentPage pt-5 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="sectionHeader p-2 px-3 px-lg-4 py-lg-3">
                <div className="flex align-items-center gap-3">
                  <h4 className="m-0 text-24 font-bold -tracking-3 text-white/75 md:text-4xl flex-1 whitespace-nowrap capitalize leading-none">
                    Privacy Policy
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className=" mx-auto space-y-6 p-2 px-3 px-lg-4 py-lg-3 text-xs">
                <p className="text-gray-400">
                  At Madhouse, we respect the privacy of our users and are
                  committed to protecting their personal information. This page
                  is used to inform visitors regarding our policies regarding
                  the collection, use, and disclosure of Personal Information if
                  anyone decided to use our Service.
                </p>
                <p className="text-gray-400">
                  If you choose to use our Service, then you agree to the
                  collection and use of information in relation to this policy.
                  The Personal Information that we collect is used for providing
                  and improving the Service. We will not use or share your
                  information with anyone except as described in this Privacy
                  Policy.
                </p>
                <p className="text-gray-400">
                  The terms used in this Privacy Policy have the same meanings
                  as in our Terms and Conditions, which are accessible at
                  Madhouse unless otherwise defined in this Privacy Policy.
                </p>

                <h2 className="text-2xl font-semibold ">
                  Collection of Information
                </h2>
                <p className="text-gray-400">
                  For a better experience, while using our Service, we may
                  require you to provide us with certain personally identifiable
                  information. The information that we request will be retained
                  by us and used as described in this privacy policy.
                </p>
                <p className="text-gray-400">
                  The app does use third-party services that may collect
                  information used to identify you.
                </p>
                <p className="text-gray-400">
                  We want to inform you that whenever you use our Service, in a
                  case of an error in the app we collect data and information
                  (through third-party products) on your phone called Log Data.
                  This Log Data may include information such as your device
                  Internet Protocol (“IP”) address, device name, operating
                  system version, the configuration of the app when utilizing
                  our Service, the time and date of your use of the Service, and
                  other statistics.
                </p>

                <h2 className="text-2xl font-semibold ">Cookies</h2>
                <p className="text-gray-400">
                  Cookies are files with a small amount of data that are
                  commonly used as anonymous unique identifiers. These are sent
                  to your browser from the websites that you visit and are
                  stored on your device's internal memory.
                </p>
                <p className="text-gray-400">
                  This Service does not use these “cookies” explicitly. However,
                  the app may use third party code and libraries that use
                  “cookies” to collect information and improve their services.
                  You have the option to either accept or refuse these cookies
                  and know when a cookie is being sent to your device. If you
                  choose to refuse our cookies, you may not be able to use some
                  portions of this Service.
                </p>

                <h2 className="text-2xl font-semibold ">Use of Information</h2>
                <p className="text-gray-400">
                  As we do not collect any personal information from our users,
                  we do not use any data for any purpose.
                </p>

                <h2 className="text-2xl font-semibold ">
                  Links to Other Sites
                </h2>
                <p className="text-gray-400">
                  This Service may contain links to other sites. If you click on
                  a third-party link, you will be directed to that site. Note
                  that these external sites are not operated by us. Therefore,
                  we strongly advise you to review the Privacy Policy of these
                  websites. We have no control over and assume no responsibility
                  for the content, privacy policies, or practices of any
                  third-party sites or services.
                </p>

                <h2 className="text-2xl font-semibold ">Children’s Privacy</h2>
                <p className="text-gray-400">
                  These Services do not address anyone under the age of 13. We
                  do not knowingly collect personally identifiable information
                  from children under 13. In the case we discover that a child
                  under 13 has provided us with personal information, we
                  immediately delete this from our servers. If you are a parent
                  or guardian and you are aware that your child has provided us
                  with personal information, please contact us so that we will
                  be able to do the necessary actions.
                </p>

                <h2 className="text-2xl font-semibold ">
                  Disclosure of Information
                </h2>
                <p className="text-gray-400">
                  We do not share any data with any third-party service
                  providers or affiliates. We do not sell or rent user data to
                  any third-party organizations.
                </p>

                <h2 className="text-2xl font-semibold ">Security</h2>
                <p className="text-gray-400">
                  We take security seriously and use industry-standard security
                  protocols to ensure that the user's data remains secure. As we
                  do not collect any data from our users, we do not store any
                  data on our servers.
                </p>

                <h2 className="text-2xl font-semibold ">
                  Changes to the Privacy Policy
                </h2>
                <p className="text-gray-400">
                  We reserve the right to change this privacy policy at any
                  time. We will notify users of any changes to the privacy
                  policy via our website. These changes are effective
                  immediately after they are posted on this page.
                </p>

                <h2 className="text-2xl font-semibold ">Contact Us</h2>
                <p className="text-gray-400">
                  If you have any questions about our privacy policy or need to
                  contact us for any reason, please email us at{" "}
                  <a
                    href="mailto:thewalkerledger@googlegroups.com"
                    className=" underline themeClr"
                  >
                    thewalkerledger@googlegroups.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;

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
