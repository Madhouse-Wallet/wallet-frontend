// lib/reapApi.js
import { lambdaInvokeFunction } from "../lib/apiCall";
const REAP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_REAP_BASE_URL,
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "x-reap-api-key": process.env.NEXT_PUBLIC_REAP_API_KEY,
    "x-reap-entity-id": process.env.NEXT_PUBLIC_REAP_ENTITY_ID,
  },
};

async function makeReapApiCall(endpoint, method = "GET", body = null) {
  const url = `${REAP_CONFIG.baseUrl}${endpoint}`;

  const options = {
    method,
    headers: REAP_CONFIG.headers,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${data.message || "Unknown error"}`
      );
    }

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

async function makeReapDbCall(
  endpoint,
  method = "GET",
  body = null,
  userId = null,
  userEmail = null
) {
  try {
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      // For POST/PUT/PATCH operations - save to database
      if (!userId) {
        return {
          success: false,
          error: "User ID is required for database operations",
          status: 400,
        };
      }

      // Generate proper response data based on endpoint and save to DB
      let responseData = {};
      let updateField = {};

      if (endpoint.includes("/business-account")) {
        // Create business account response structure
        responseData = {
          business: {
            id: `business_${Date.now()}`,
            accountStatus: "under_review",
            name: body.name,
            registeredAddress: body.registeredAddress,
            registeredIdentifier: body.registeredIdentifier,
            termsOfServiceAcceptance: body.termsOfServiceAcceptance,
          },
          organisation: {
            id: `org_${Date.now()}`,
            name: body.name,
          },
          wallets: [
            {
              network: "Ethereum",
              address: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock wallet address
            },
          ],
          totalBalances: [
            {
              currency: "USDC",
              amount: 0,
            },
          ],
          availableBalances: [
            {
              currency: "USDC",
              amount: 0,
            },
          ],
        };

        updateField = {
          $set: {
            businessAccountDetail: {
              status: "created",
              data: responseData,
              createdAt: new Date().toISOString(),
            },
          },
        };

        // Save to database
        await updateUser({ _id: userId }, updateField);

        return {
          success: true,
          data: responseData,
          status: 201,
        };
      } else if (endpoint.includes("/parties")) {
        responseData = {
          id: `party_${Date.now()}`,
          type: body.type,
          name: body.name,
          accounts: body.accounts,
        };

        updateField = {
          $push: {
            receivingPartyDetail: {
              status: "created",
              data: responseData,
              createdAt: new Date().toISOString(),
            },
          },
        };

        // Save to database
        await updateUser({ _id: userId }, updateField);

        return {
          success: true,
          data: responseData,
          status: 201,
        };
      } else if (endpoint.includes("/payments")) {
        responseData = {
          paymentId: `payment_${Date.now()}`,
          status: "confirmed",
          validFrom: body.validFrom || new Date().toISOString(),
          validTo:
            body.validTo ||
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default +24hrs
          payment: body.payment,
          receivingParty: body.receivingParty,
          createdAt: new Date().toISOString(),
        };

        updateField = responseData;

        // Save to database
        await createPayment(updateField, userId);

        return {
          success: true,
          data: responseData,
          status: 201,
        };
      }
    } else if (method === "GET") {
      // For GET operations - retrieve from database
      if (!userEmail) {
        return {
          success: false,
          error: "User email is required for database retrieval",
          status: 400,
        };
      }

      const userExist = await getUser(userEmail);
      console.log("line-190", userExist, userEmail);
      if (!userExist) {
        return {
          success: false,
          error: "User not found",
          status: 404,
        };
      }

      // Get the right data based on endpoint
      let responseData = null;

      if (endpoint.includes("/business-account")) {
        responseData = userExist?.userId.businessAccountDetail;
      } else if (endpoint.includes("/parties")) {
        responseData = userExist?.userId.receivingPartyDetail;
        return {
          success: true,
          data: responseData,
          status: 200,
        };
      } else if (endpoint.includes("/payments")) {
        console.log("line-212", userExist?.userId?._id);
        responseData = await getPayments(userExist?.userId?._id);
      }

      if (!responseData || !responseData.data) {
        return {
          success: false,
          error: "Requested data not found for user",
          status: 404,
        };
      }

      return {
        success: true,
        data: responseData.data,
        status: 200,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.status || 500,
    };
  }
}

// Business Account API functions
export const businessAccountApi = {
  createBusinessAccount: async (accountData, userId) => {
    const body = {
      name: accountData.name || "Default Business Name",
      registeredAddress: {
        type: "postal",
        street: accountData.registeredAddress?.street || "Default Street",
        city: accountData.registeredAddress?.city || "Default City",
        state: accountData.registeredAddress?.state || "Default State",
        country: accountData.registeredAddress?.country || "US",
        postalCode: accountData.registeredAddress?.postalCode || "00000",
      },
      registeredIdentifier: {
        type:
          accountData.registeredIdentifier?.type || "tax_identification_number",
        value: accountData.registeredIdentifier?.value || "default_tax_id",
      },
      termsOfServiceAcceptance: {
        date:
          accountData.termsOfServiceAcceptance?.date ||
          new Date().toISOString(),
        ipAddress:
          accountData.termsOfServiceAcceptance?.ipAddress || "127.0.0.1",
      },
    };

    // return await makeReapApiCall("/business-account", "POST", body);
    return await makeReapDbCall("/business-account", "POST", body, userId);
  },

  getBusinessAccount: async (businessId) => {
    if (!businessId) {
      return {
        success: false,
        error: "Business ID is required",
        status: 400,
      };
    }
    // return await makeReapApiCall(`/business-account/${businessId}`, "GET");
    return await makeReapDbCall(
      `/business-account/${businessId}`,
      "GET",
      null,
      null,
      businessId
    );
  },
};

// Parties API functions
export const partiesApi = {
  createParty: async (partyData, userId) => {
    const body = {
      type: partyData.type || "individual",
      name: {
        name: partyData.name?.name || "Default Name",
      },
      accounts: partyData.accounts || [
        {
          type: "bank",
          identifier: {
            standard: partyData.identifier?.standard || "iban",
            value: partyData.identifier?.value || "default_iban",
          },
          network: partyData.network || "SWIFT",
          currencies: partyData.currencies || ["USD"],
          provider: {
            name: partyData.provider?.name || "Default Bank",
            country: partyData.provider?.country || "US",
            networkIdentifier:
              partyData.provider?.networkIdentifier || "DEFAULT01",
            networkIntermediateIdentifier:
              partyData.provider?.networkIntermediateIdentifier || "",
          },
          addresses: [
            {
              type: "postal",
              street: partyData.address?.street || "Default Street",
              city: partyData.address?.city || "Default City",
              state: partyData.address?.state || "Default State",
              country: partyData.address?.country || "US",
              postalCode: partyData.address?.postalCode || "00000",
            },
          ],
        },
      ],
    };

    // return await makeReapApiCall("/parties", "POST", body);
    return await makeReapDbCall("/parties", "POST", body, userId);
  },

  getParty: async (receivingPartyId) => {
    if (!receivingPartyId) {
      return {
        success: false,
        error: "Receiving Party ID is required",
        status: 400,
      };
    }
    // return await makeReapApiCall(`/parties/${receivingPartyId}`, "GET");
    return await makeReapDbCall(
      `/parties/${receivingPartyId}`,
      "GET",
      null,
      null,
      receivingPartyId
    );
  },
};

// Payment API functions
export const paymentApi = {
  createPayment: async (paymentData, userId) => {
    const body = {
      receivingParty: {
        type: paymentData.receivingParty?.type || "company",
        name: {
          name:
            paymentData.receivingParty?.name?.name || "Default Company Name",
        },
        accounts: paymentData.receivingParty?.accounts || [
          {
            type: "bank",
            identifier: {
              standard:
                paymentData.receivingParty?.identifier?.standard ||
                "account_number",
              value:
                paymentData.receivingParty?.identifier?.value || "012345678",
            },
            network: paymentData.receivingParty?.network || "SWIFT",
            currencies: paymentData.receivingParty?.currencies || ["USD"],
            provider: {
              name:
                paymentData.receivingParty?.provider?.name || "Default Bank",
              country: paymentData.receivingParty?.provider?.country || "US",
              networkIdentifier:
                paymentData.receivingParty?.provider?.networkIdentifier ||
                "DEFAULT01",
            },
            addresses: [
              {
                type: "postal",
                street:
                  paymentData.receivingParty?.address?.street ||
                  "Default Street",
                city:
                  paymentData.receivingParty?.address?.city || "Default City",
                state:
                  paymentData.receivingParty?.address?.state || "Default State",
                country: paymentData.receivingParty?.address?.country || "US",
                postalCode:
                  paymentData.receivingParty?.address?.postalCode || "00000",
              },
            ],
          },
        ],
        id: paymentData.receivingParty?.id || "default_id",
      },
      payment: {
        receivingAmount: paymentData.payment?.receivingAmount || 0,
        receivingCurrency: paymentData.payment?.receivingCurrency || "USD",
        description:
          paymentData.payment?.description || "Default payment description",
        purposeOfPayment:
          paymentData.payment?.purposeOfPayment || "payment_for_goods",
        requireApproval: paymentData.payment?.requireApproval ?? true,
        sourceOfFunds: paymentData.payment?.sourceOfFunds || "business_income",
        senderCurrency: paymentData.payment?.senderCurrency || "USDC",
        metadata: {
          content: paymentData.payment?.metadata?.content || "Default metadata",
        },
      },
    };

    // return await makeReapApiCall("/payments", "POST", body);
    return await makeReapDbCall("/payments", "POST", body, userId);
  },

  getPayment: async (paymentId) => {
    if (!paymentId) {
      return {
        success: false,
        error: "Payment ID is required",
        status: 400,
      };
    }
    // return await makeReapApiCall(`/payments/${paymentId}`, "GET");
    return await makeReapDbCall(
      `/payments/${paymentId}`,
      "GET",
      null,
      null,
      paymentId
    );
  },
};

// Export all APIs as a single object for convenience
export const reapApi = {
  businessAccount: businessAccountApi,
  parties: partiesApi,
  payment: paymentApi,
};

const updateUser = async (findData, updtData) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { findData: findData, updtData: updtData },
      "madhouse-backend-production-updtUser"
    );
    if (apiResponse?.status == "success") {
      return {
        status: "success",
        message: apiResponse?.message,
        userId: apiResponse?.data,
      };
    } else {
      return {
        status: "failure",
        message: apiResponse?.message,
        error: apiResponse?.error,
      };
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Internal server error" };
  }
};

const getUser = async (userEmail) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { email: userEmail },
      "madhouse-backend-production-getUser"
    );
    if (apiResponse?.status == "success") {
      return {
        status: "success",
        message: apiResponse?.message,
        userId: apiResponse?.data,
      };
    } else {
      return {
        status: "failure",
        message: apiResponse?.message,
        error: apiResponse?.error,
      };
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createPayment = async (paymentData, userId) => {
  try {
    const apiResponse = await lambdaInvokeFunction(
      { ...paymentData, userId: userId },
      "madhouse-backend-production-addPayment"
    );
    if (apiResponse?.status == "success") {
      return {
        status: "success",
        message: apiResponse?.message,
        userId: apiResponse?.data,
      };
    } else {
      return {
        status: "failure",
        message: apiResponse?.message,
        error: apiResponse?.error,
      };
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Internal server error" };
  }
};

const getPayments = async (userId) => {
  try {
    console.log("line-498", userId);
    const apiResponse = await lambdaInvokeFunction(
      { userId, page: 1, limit: 20 },
      "madhouse-backend-production-getUserPayments"
    );
    console.log("line-528", apiResponse);
    if (apiResponse?.status == "success") {
      return {
        status: "success",
        message: apiResponse?.message,
        data: apiResponse?.data,
      };
    } else {
      return {
        status: "failure",
        message: apiResponse?.message,
        error: apiResponse?.error,
      };
    }
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
