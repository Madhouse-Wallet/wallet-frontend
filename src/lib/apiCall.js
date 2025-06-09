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

//update-lnaddress
export const updateLNAddressCall = async (email, username) => {
  try {
    try {
      return await fetch(`/api/update-lnaddress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
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

export const addProvisionData = async (email) => {
  try {
    try {
      return await fetch(`/api/add-provision`, {
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

export const addProvisionLambda = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/addlnbitUser`,
      {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const updateLNAddress = async (data) => {
  try {
    return await fetch(
      `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/updt-lnaddress`,
      {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const addCreditCard = async (data) => {
  try {
    return await fetch(`/api/create-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log("addCreditCard error-->", error);
    return false;
  }
};

export const delCreditCard = async (data) => {
  try {
    return await fetch(`/api/delete-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.log("delCreditCard error-->", error);
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
          token: true,
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
          onchain_address,
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

export const btcSat = async (amount, refund_address = "") => {
  try {
    try {
      return await fetch(`/api/btc-sat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          refund_address,
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

export const receiveBtc = async (
  amount,
  email,
  memo = "Madhouse Wallet",
  publicKey = ""
) => {
  try {
    try {
      return await fetch(`/api/receive-bitcoin-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email,
          memo,
          publicKey,
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

//getBitcoinAddress
export const decodeBitcoinAddress = async (wif) => {
  try {
    try {
      return await fetch(`/api/getBitcoinAddress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wif,
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

//send-bitcoin-lnbit
export const sendBtc = async (invoice, email) => {
  try {
    try {
      return await fetch(`/api/send-bitcoin-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice,
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

export const createCoinosInvoice = async (
  token,
  amount,
  type = "bitcoin",
  secret
) => {
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
          secret,
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
