import axios from "axios";

export const getUser = async (email) => {
  try {
    try {
      return await fetch(`/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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




export const getUserToken = async (email) => {
  try {
    try {
      return await fetch(`/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: true
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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


//
export const getLnbitId = async (email) => {
  try {
    try {
      return await fetch(`/api/get-lndb-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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


export const sendLnbit = async (amount, onchain_address) => {
  try {
    try {
      return await fetch(`/api/send-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          onchain_address
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


export const btcSat = async (amount, refund_address="") => {
  try {
    try {
      return await fetch(`/api/btc-sat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, refund_address
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

export const receiveBtc = async (amount, publicKey="") => {
  try {
    try {
      return await fetch(`/api/receive-bitcoin-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          publicKey
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


//send-bitcoin-lnbit
export const sendBtc = async (invoice) => {
  try {
    try {
      return await fetch(`/api/send-bitcoin-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data-->", data);
          return data;
        });
    } catch (error) {
      console.log(error);
      return false;
    }
  } catch (error) {
    console.log("sendBtc error-->", error);
    return false;
  }
};



// receive-bitcoin-lnbit

export const getBitcoinAddress = async (email) => {
  try {
    try {
      return await fetch(`/api/generate-bitcoin-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("getBitcoinAddress-->", data);
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
      return await fetch(`/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ensName,
          type: "ens",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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

export const getSubdomainApproval = async (
  address,
  defApiKey,
  defApiSecret,
  userAddress
) => {
  try {
    try {
      return await fetch(`/api/relayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          defApiKey,
          defApiSecret,
          userAddress,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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

export const registerEnsName = async (
  name,
  smartAccount,
  defApiKey,
  defApiSecret,
  registrarControllerAddress,
  resolverAddress,
  reverseRegistrarAddress,
  baseRegistrarAddress,
  duration = 31557600
) => {
  try {
    console.log("details", name, smartAccount, defApiKey);

    const response = await axios.post(
      "/api/register-ens",
      {
        name,
        smartAccount,
        defApiKey,
        defApiSecret,
        registrarControllerAddress,
        resolverAddress,
        reverseRegistrarAddress,
        baseRegistrarAddress,
        duration,
      },
      {
        timeout: 90000, // 60 seconds timeout
      }
    );

    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

export const getUserWallet = async (wallet) => {
  try {
    try {
      return await fetch(`/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
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
      console.log("email", findData, updtData);
      return await fetch(`/api/updt-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findData,
          updtData,
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
        // console.log("data-->", data);
        return data;
      });
  } catch (error) {
    console.log("error-->", error);
    return false;
  }
};

export const registerCoinosUser = async (username, password) => {
  try {
    try {
      return await fetch(`/api/coinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username,
          password,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("registerCoinosUser-->", data);
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

export const createCoinosInvoice = async (token, amount, type = "bitcoin", secret) => {
  try {
    try {
      return await fetch(`/api/coinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createInvoice",
          token,
          amount,
          type,
          secret
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log("createCoinosInvoice-->", data);
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


export const sendBitcoinn = async (token, amount, address) => {
  try {
    try {
      return await fetch(`/api/coinos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendBitcoin",
          token,
          amount,
          address,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("sendBitcoin-->", data);
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
