// lib/reapApi.js

const REAP_CONFIG = {
  baseUrl: "https://sandbox.payments.reap.global/api",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
    "x-reap-api-key": process.env.REAP_API_KEY || "uopb3ocp093mutg0p8v2gde94",
    "x-reap-entity-id":
      process.env.REAP_ENTITY_ID || "7a7e03f5-6da3-45f1-aecf-d8c5aa48ab2c",
  },
};

// Generic API call function
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

// Business Account API functions
export const businessAccountApi = {
  createBusinessAccount: async (accountData) => {
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

    return await makeReapApiCall("/business-account", "POST", body);
  },

  getBusinessAccount: async (businessId) => {
    if (!businessId) {
      return {
        success: false,
        error: "Business ID is required",
        status: 400,
      };
    }
    return await makeReapApiCall(`/business-account/${businessId}`, "GET");
  },
};

// Parties API functions
export const partiesApi = {
  createParty: async (partyData) => {
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

    return await makeReapApiCall("/parties", "POST", body);
  },

  getParty: async (receivingPartyId) => {
    if (!receivingPartyId) {
      return {
        success: false,
        error: "Receiving Party ID is required",
        status: 400,
      };
    }
    return await makeReapApiCall(`/parties/${receivingPartyId}`, "GET");
  },
};

// Payment API functions
export const paymentApi = {
  createPayment: async (paymentData) => {
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

    return await makeReapApiCall("/payments", "POST", body);
  },

  getPayment: async (paymentId) => {
    if (!paymentId) {
      return {
        success: false,
        error: "Payment ID is required",
        status: 400,
      };
    }
    return await makeReapApiCall(`/payments/${paymentId}`, "GET");
  },
};

// Export all APIs as a single object for convenience
export const reapApi = {
  businessAccount: businessAccountApi,
  parties: partiesApi,
  payment: paymentApi,
};
