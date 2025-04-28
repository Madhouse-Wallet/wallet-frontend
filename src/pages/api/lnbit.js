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
const logIn = async () => {
  try {
    // Fixed IP address as used in curl commands
   let response = await fetch(`${process.env.NEXT_PUBLIC_LNBIT_URL}api/v1/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": "suffescom",
        "password": "suffescom"
      }),
    });
    response = await response.json()
    if (response?.access_token) {
      return {
        status: true,
        data: { "token": response?.access_token }
      }
    } else {
      return {
        status: false,
        msg: response?.detail
      }
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed"
    }
  }
};
/**
 * Create a fixed shift using a previously obtained quote
 * @param {Object} shiftParams - Parameters for the shift request
 * @param {string} shiftParams.settleAddress - Destination address
 * @param {string} shiftParams.affiliateId - Affiliate ID
 * @param {string} shiftParams.quoteId - ID of the previously obtained quote
 * @param {string} secretKey - Your SideShift API secret key
 * @returns {Promise<Object>} Shift response object
 */
const createUser = async (data, token, apiKey) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS

    // NEXT_PUBLIC_LNBIT_API_KEY  ,   process.env.NEXT_PUBLIC_LNBIT_URL
    let response = await fetch(`${process.env.NEXT_PUBLIC_LNBIT_URL}users/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `cookie_access_token=${token}; is_lnbits_user_authorized=true`
        ,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json()
    // console.log("response-->", response)
    if (response?.email) {
      return {
        status: true,
        data: response
      }
    } else {
      return {
        status: false,
        msg: response?.detail
      }
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed"
    }
  }
};


 

const getUser = async (id, token, apiKey) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${process.env.NEXT_PUBLIC_LNBIT_URL}users/api/v1/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `cookie_access_token=${token}; is_lnbits_user_authorized=true`
        ,
        "X-API-KEY": apiKey,
      }
    });
    response = await response.json()
    // console.log("response-->", response)
    if (response?.email) {
      return {
        status: true,
        data: response
      }
    } else {
      return {
        status: false,
        msg: response?.detail
      }
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed"
    }
  }
};



const createTpos = async (data, token, apiKey) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${process.env.NEXT_PUBLIC_LNBIT_URL}tpos/api/v1/tposs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `cookie_access_token=${token}; is_lnbits_user_authorized=true`
        ,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json()
    // console.log("response-->", response)
    if (response?.id) {
      return {
        status: true,
        data: response
      }
    } else {
      return {
        status: false,
        msg: response?.detail
      }
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed"
    }
  }
};




const createBlotzAutoReverseSwap = async (data, token, apiKey) => {
  try {
    //process.env.NEXT_PUBLIC_TBTC_PRICE_CONTRACT_ADDRESS
    let response = await fetch(`${process.env.NEXT_PUBLIC_LNBIT_URL}boltz/api/v1/swap/reverse/auto`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `cookie_access_token=${token}; is_lnbits_user_authorized=true`
        ,
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(data),
    });
    response = await response.json()
    // console.log("response-->", response)
    if (response?.id) {
      return {
        status: true,
        data: response
      }
    } else {
      return {
        status: false,
        msg: response?.detail
      }
    }
  } catch (error) {
    console.error("lnbit login API Error:", error);
    return {
      status: false,
      msg: "fetch failed"
    }
  }
};



module.exports = {
  logIn,
  createUser,
  getUser,
  createTpos,
  createBlotzAutoReverseSwap
}  