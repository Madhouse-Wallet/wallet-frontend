export const getUser = async (email) => {
    try {
        try {
            // console.log(email)
            return await fetch(`/api/get-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};


export const getEnsName = async (ensName) => {
    try {
        try {
            // console.log(email)
            return await fetch(`/api/get-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ensName,
                    type:"ens"
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};



export const getSubdomainApproval = async (address, defApiKey, defApiSecret,  userAddress ) => {
    try {
        try {
            // console.log(email)
            return await fetch(`/api/relayer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address, defApiKey, defApiSecret,  userAddress 
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};


export const getUserWallet = async (wallet) => {
    try {
        try {
            // console.log(email)
            return await fetch(`/api/get-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};

export const updtUser = async (findData, updtData) => {
    try {
        try {
            console.log("email", findData, updtData)
            return await fetch(`/api/updt-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    findData,
                    updtData
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};

export const delUser = async (email) => {
    try {
        try {
            return await fetch(`/api/del-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    // console.log("data-->", data);
                    return data;
                });
        } catch (error) {
            console.log(error);
            return false;
        }
    } catch (error) {
        console.log("error-->", error);
        return false;
    }
};

export const sendOTP = async ({ email, name, otp, subject, type }) => {
    try {
      // console.log(email)
      return await fetch(`/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject,
          emailData: {
            name: name,
            verificationCode: otp,
          },
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log("error-->", error);
      return false;
    }
  };
