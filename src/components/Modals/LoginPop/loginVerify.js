import React, { useEffect } from 'react';

const EmailVerificationButton = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.phone.email/verify_email_v1.js";
        script.async = true;
        document.querySelector('.pe_verify_email').appendChild(script);

        window.phoneEmailReceiver = function(userObj) {
            const user_json_url = userObj.user_json_url;
            alert(`Email Verification Successful !!\nPlease fetch authenticated email id from the following JSON file URL: ${user_json_url}`);
        };

        return () => {
            window.phoneEmailReceiver = null;
        };
    }, []);

    return (
        <div className="pe_verify_email" data-client-id="17834183298366261179"></div>
    );
};

export default EmailVerificationButton;
