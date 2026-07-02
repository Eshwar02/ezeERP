import { Client, Account, OAuthProvider } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6a3cd70c00252a8a0012");

export const account = new Account(client);
export { OAuthProvider };
