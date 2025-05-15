const { ModifierFlags } = require("typescript");
const { Module } = require("webpack");

/**
 * Request a quote from the SideShift API
 * @param {Object} quoteParams - Parameters for the quote request
 * @param {string} quoteParams.affiliateId - Affiliate ID
 * @param {string} quoteParams.depositCoin - Deposit coin symbol
 * @param {string} quoteParams.depositNetwork - Deposit network
 * @param {string} quoteParams.settleCoin - Settlement coin symbol
 * @param {string} quoteParams.settleNetwork - Settlement network
 * @param {string} quoteParams.depositAmount - Amount to deposit
 * @param {string} secretKey - Your SideShift API secret key
 * @returns {Promise<Object>} Quote response object
 */
const logIn = async (type = 1) => {
  try {
    let backendUrl = "";
    let username = "";
    let password = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      username = process.env.NEXT_PUBLIC_LNBIT_USERNAME_2;
      password = process.env.NEXT_PUBLIC_LNBIT_PASS_2;
    }
    // Fixed IP address as used in curl commands
    let response = await fetch(`${backendUrl}api/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    response = await response.json();
    // console.log("response login",response)
    if (response?.access_token) {
      return {
        status: true,
        data: { token: response?.access_token },
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    // NEXT_PUBLIC_LNBIT_API_KEY  ,   process.env.NEXT_PUBLIC_LNBIT_URL
    let response = await fetch(`${backendUrl}users/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    // console.log("response create user",response)

    if (response?.email) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;

      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}users/api/v1/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
    });
    response = await response.json();
    // console.log("response get user",response)

    if (response?.email) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const createTpos = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    // console.log("type",backendUrl, apiKey )
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}tpos/api/v1/tposs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    // console.log("createTpos createTpos-->", type, response)
    if (response?.id) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const createBlotzAutoReverseSwap = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(
      `${process.env.NEXT_PUBLIC_LNBIT_URL}boltz/api/v1/swap/reverse/auto`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(data),
      }
    );
    response = await response.json();
    if (response?.id) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const createInvoice = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.bolt11) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const payInvoice = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.payment_hash) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const createSwapReverse = async (data, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}boltz/api/v1/swap/reverse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.invoice) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${backendUrl}boltz/api/v1/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json();
    if (response?.address) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;

      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(
      `${backendUrl}api/v1/payments/stats/wallets?wallet_id=${walletId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
      }
    );
    response = await response.json();
    // console.log("response get user",response)

    if (response?.email) {
      return {
        status: true,
        data: response,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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

const getPayments = async (walletId, token, type = 1) => {
  try {
    let backendUrl = "";
    let apiKey = "";
    if (type == 1) {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY;
    } else {
      backendUrl = process.env.NEXT_PUBLIC_LNBIT_URL_2;
      apiKey = process.env.NEXT_PUBLIC_LNBIT_API_KEY_2;
    }
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(
      `${backendUrl}api/v1/payments/all/paginated?wallet_id=${walletId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `cookie_access_token=${token}; is_lnbits_user_authorized=true`,
          "X-API-KEY": apiKey,
        },
      }
    );
    response = await response.json();
    // console.log("response get user",response)

    if (response?.data) {
      return {
        status: true,
        data: response?.data,
      };
    } else {
      return {
        status: false,
        msg: response?.detail,
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
  getStats,
  getPayments,
};
