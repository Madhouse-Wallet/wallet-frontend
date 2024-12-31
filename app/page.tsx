"use client";

import type { Theme } from "@mui/material/styles";
import { ThemeProvider } from "@/components/ContextApi/ThemeContext";
import { PasskeyArgType } from "@safe-global/protocol-kit";
import { useState } from "react";

import LoginWithPasskey from "@/components/LoginWithPasskey";
import SafeAccountDetails from "@/components/SafeAccountDetails";
import SafeThemeProvider from "../components/SafeThemeProvider";
import { createPasskey, storePasskeyInLocalStorage } from "../lib/passkeys";
import Dashboard from "./dashboard/page";

function Create4337SafeAccount() {
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyArgType>();

  async function handleCreatePasskey() {
    const passkey = await createPasskey();

    storePasskeyInLocalStorage(passkey);
    setSelectedPasskey(passkey);
  }

  async function handleSelectPasskey(passkey: PasskeyArgType) {
    setSelectedPasskey(passkey);
  }

  return (
    <>
      <ThemeProvider>
        {/* {selectedPasskey ? (
          <SafeAccountDetails passkey={selectedPasskey} />
        ) : (
          <LoginWithPasskey
            handleCreatePasskey={handleCreatePasskey}
            handleSelectPasskey={handleSelectPasskey}
          />
        )} */}
        <Dashboard />
      </ThemeProvider>
    </>
  );
}

export default Create4337SafeAccount;
