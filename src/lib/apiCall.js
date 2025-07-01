import axios from "axios";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION;

export const lambdaInvokeFunction = async (payload, FUNCTION_NAME) => {
  const lambdaClient = new LambdaClient({
    region: REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_KEY,
    },
  });

  const command = new InvokeCommand({
    FunctionName: FUNCTION_NAME,
    Payload: new TextEncoder().encode(JSON.stringify(payload)),
    LogType: "Tail",
  });

  try {
    const response = await lambdaClient.send(command);
    const result = new TextDecoder().decode(response.Payload);

    if (response.LogResult) {
      console.log(
        "Lambda logs:",
        Buffer.from(response.LogResult, "base64").toString("ascii")
      );
    }

    // return JSON.parse(result);
    const parsed = JSON.parse(result);
    if (parsed.body) {
      parsed.body = JSON.parse(parsed.body);
    }

    return parsed.body || parsed;
  } catch (error) {
    console.log("error lambdaInvokeFunction ---->", error);
  }
};
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
    const apiResponse = await lambdaInvokeFunction(
      data,
      "madhouse-backend-production-addlnbitUser"
    );
    // console.log(" addProvisionLambda apiResponse-->", apiResponse)
    return true;
    // return await fetch(
    //   `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/addlnbitUser`,
    //   {
    //     method: "POST",

    //     headers: { "Content-Type": "application/json" },

    //     body: JSON.stringify(data),
    //   }
    // )
    //   .then((res) => res.json())
    //   .then((data) => {
    //     return data;
    //   });
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const checkLnbitCreds = async (data) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      data,
      "madhouse-backend-production-checkLnbitCreds"
    );
    // console.log(" addProvisionLambda apiResponse-->", apiResponse)
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const updateLNAddress = async (data) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      data,
      "madhouse-backend-production-updateLnAddress"
    );
    // console.log(" updateLNAddress apiResponse-->", apiResponse)
    return apiResponse;
    // return await fetch(
    //   `${process.env.NEXT_PUBLIC_LAMBDA_API_URL}api/v1/updt-lnaddress`,
    //   {
    //     method: "POST",

    //     headers: { "Content-Type": "application/json" },

    //     body: JSON.stringify(data),
    //   }
    // )
    //   .then((res) => res.json())
    //   .then((data) => {
    //     return data;
    //   });
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

//send-lnbit-usdc
export const sendLnbitUsdc = async (
  wallet,
  amount,
  lnbitId_3,
  lnbitWalletId_3,
  lnbitAdminKey_3
) => {
  try {
    try {
      return await fetch(`/api/send-lnbit-usdc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          amount,
          lnbitId_3,
          lnbitWalletId_3,
          lnbitAdminKey_3,
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

export const sendLnbit = async (
  amount,
  onchain_address,
  lnbitId_3,
  lnbitWalletId_3,
  lnbitAdminKey_3
) => {
  try {
    try {
      return await fetch(`/api/send-lnbit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          onchain_address,
          lnbitId_3,
          lnbitWalletId_3,
          lnbitAdminKey_3,
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

export const btcSat = async (
  amount,
  refund_address = "",
  lnbitId_3,
  lnbitWalletId_3
) => {
  try {
    try {
      return await fetch(`/api/btc-sat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          refund_address,
          lnbitId_3,
          lnbitWalletId_3,
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
      console.log("line-541");
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

export const deleteBankAccountt = async (email, partyId) => {
  try {
    try {
      console.log("line-541");
      return await fetch(`/api/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          partyId,
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

export const sendTransferDetail = async ({
  email,
  // name,
  transferData,
  subject,
  type,
}) => {
  try {
    return await fetch(`/api/send-email-transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        subject,
        emailData: {
          // name: name,
          transferDetail: transferData,
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
