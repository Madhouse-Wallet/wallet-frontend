const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION;

const lambdaInvokeFunction = async (payload, FUNCTION_NAME) => {
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

    const parsed = JSON.parse(result);
    if (parsed.body) {
      parsed.body = JSON.parse(parsed.body);
    }

    return parsed.body || parsed;
  } catch (error) {
    console.log("error lambdaInvokeFunction ---->", error);
    return {
      status: false,
      msg: "Lambda call failed",
    };
  }
};

const logIn = async (type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "logIn", data: [type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("logIn apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const userLogIn = async (type = 1, usr) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "userLogIn", data: [type, usr] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("userLogIn apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createUser = async (data, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createUser", data: [data, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createUser apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const addUserWallet = async (id, data, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "addUserWallet", data: [id, data, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("addUserWallet apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.log("add user wallet error-->", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

// splitpayments/api/v1/targets
const splitPaymentTarget = async (data, apiKey, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "splitPaymentTarget", data: [data, apiKey, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("splitPaymentTarget apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

// create lnurlpCreate link
const lnurlpCreate = async (data, apiKey, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "lnurlpCreate", data: [data, apiKey, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("lnurlpCreate apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

// create lnurlpCreate link
const withdrawLinkCreate = async (data, apiKey, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "withdrawLinkCreate", data: [data, apiKey, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("withdrawLinkCreate apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getUser = async (id, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "getUser", data: [id, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("getUser apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createTpos = async (data, apiKey, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createTpos", data: [data, apiKey, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createTpos apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createBlotzAutoReverseSwap = async (data, apiKey, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createBlotzAutoReverseSwap", data: [data, apiKey, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createBlotzAutoReverseSwap apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createInvoice = async (data, token, type = 1, apiKey) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createInvoice", data: [data, token, type, apiKey] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createInvoice apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const payInvoice = async (data, token, type = 1, apiKey) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "payInvoice", data: [data, token, type, apiKey] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("payInvoice apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const decodeInvoice = async (invoice, token, type = 1, apiKey) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "decodeInvoice", data: [invoice, token, type, apiKey] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("decodeInvoice apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("decodeInvoice API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createSwapReverse = async (data, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createSwapReverse", data: [data, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createSwapReverse apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const createSwap = async (data, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "createSwap", data: [data, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("createSwap apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getStats = async (walletId, token, type = 1) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { name: "getStats", data: [walletId, token, type] },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("getStats apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getPayments = async (
  token,
  type = 1,
  fromDate = null,
  toDate = null,
  tag = null,
  apiKey = null
) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      {
        name: "getPayments",
        data: [token, type, fromDate, toDate, tag, apiKey],
      },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("getPayments apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getWithdraw = async (token, type = 1, apiKey = null) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      {
        name: "getWithdraw",
        data: [token, type, apiKey],
      },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("getWithdraw apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

const getDeposit = async (token, type = 1, apiKey = null) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      {
        name: "getDeposit",
        data: [token, type, apiKey],
      },
      "madhouse-backend-production-lnbitCalls"
    );
    // console.log("getDeposit apiResponse lambdaInvokeFunction -->", apiResponse?.data)
    if (apiResponse?.status == "success") {
      return apiResponse?.data;
    } else {
      return {
        status: false,
        msg: "fetch failed",
      };
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed",
    };
  }
};

module.exports = {
  logIn,
  createUser,
  getUser,
  createTpos,
  createBlotzAutoReverseSwap,
  createInvoice,
  createSwapReverse,
  createSwap,
  payInvoice,
  decodeInvoice,
  getStats,
  getPayments,
  addUserWallet,
  getWithdraw,
  getDeposit,
  userLogIn,
  splitPaymentTarget,
  lnurlpCreate,
  withdrawLinkCreate,
};
