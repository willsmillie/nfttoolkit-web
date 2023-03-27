declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_PROJECT_ID: string;
      ETH_ACCOUNT_PRIVATE_KEY: string;
      ETH_ACCOUNT_ADDRESS: string;
      CHAIN_ID: string | number;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
