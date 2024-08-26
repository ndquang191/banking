"use server";

import { createAdminClient, createSessionClient } from "../appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import {
	CountryCode,
	ProcessorTokenCreateRequest,
	ProcessorTokenCreateRequestProcessorEnum,
	Products,
} from "plaid";
import { plaidClient } from "../plaid";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { revalidatePath } from "next/cache";
const {
	APPWRITE_DATABASE_ID: DATABASE_ID,
	APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
	APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const signIn = async ({ email, password }: { email: string; password: string }) => {
	try {
		const { account } = await createAdminClient();

		const response = await account.createEmailPasswordSession(email, password);

		return parseStringify(response);
	} catch (err) {
		console.log("err", err);
	}
};
export const signUp = async ({ password, ...userData }: SignUpParams) => {
	const { email, firstName, lastName } = userData;

	try {
		const { account, database } = await createAdminClient();

		const newUserAccount = await account.create(
			ID.unique(),
			email,
			password,
			`${firstName} ${lastName}`
		);

		if (!newUserAccount) throw new Error("Error creating user");

		const dwollaCustomerUrl = await createDwollaCustomer({ ...userData, type: "personal" });

		if (!dwollaCustomerUrl) throw new Error("Error creating dwolla curtomer");

		const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

		const newUser = await database.createDocument(DATABASE_ID!, USER_COLLECTION_ID!, ID.unique(), {
			...userData,
			userId: newUserAccount.$id,
			dwollaCustomerId,
			dwollaCustomerUrl,
		});
		const session = await account.createEmailPasswordSession(userData.email, password);

		cookies().set("appwrite-session", session.secret, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
		});

		return parseStringify(newUser);
	} catch (err) {
		console.log(err);
	}
};

export async function getLoggedInUser() {
	try {
		const { account } = await createSessionClient();
		const user = await account.get();
		return parseStringify(user);
	} catch (err) {
		return null;
	}
}

export const logoutAccount = async () => {
	try {
		const { account } = await createSessionClient();

		cookies().delete("appwrite-session");
	} catch (err) {
		return null;
	}
};

export const createLinkToken = async (user: User) => {
	try {
		const tokenParams = {
			user: {
				client_user_id: user.$id,
			},
			client_name: `${user.firstName} ${user.lastName}`,
			products: ["auth"] as Products[],
			language: "en",
			country_codes: ["US"] as CountryCode[],
		};

		const response = await plaidClient.linkTokenCreate(tokenParams);

		return parseStringify({
			linkToken: response.data.link_token,
		});
	} catch (err) {
		console.log(err);
	}
};

export const createBankAccount = async ({
	userId,
	bankId,
	accountId,
	accessToken,
	fundingSourceUrl,
	shareableId,
}: createBankAccountProps) => {
	try {
		const { database } = await createAdminClient();

		const bankAccount = await database.createDocument(DATABASE_ID!, BANK_COLLECTION_ID!, ID.unique(), {
			userId,
			bankId,
			accountId,
			accessToken,
			fundingSourceUrl,
			shareableId,
		});
	} catch (err) {
		console.log(err);
	}
};

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
	try {
		const response = await plaidClient.itemPublicTokenExchange({
			public_token: publicToken,
		});

		const accessToken = response.data.access_token;
		const itemId = response.data.item_id;

		const accountsResponse = await plaidClient.accountsGet({
			access_token: accessToken,
		});
		const accountData = accountsResponse.data.accounts[0];
		const request: ProcessorTokenCreateRequest = {
			access_token: accessToken,
			account_id: accountData.account_id,
			processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
		};

		const processorTokenResponse = await plaidClient.processorTokenCreate(request);

		const processorToken = processorTokenResponse.data.processor_token;

		//create a funding source URL for the account

		const fundingSourceUrl = await addFundingSource({
			dwollaCustomerId: user.dwollaCustomerId,
			processorToken,
			bankName: accountData.name,
		});

		// if the funding srouce is not exist

		if (!fundingSourceUrl) throw Error;

		await createBankAccount({
			userId: user.$id,
			bankId: itemId,
			accountId: accountData.account_id,
			accessToken,
			fundingSourceUrl,
			shareableId: encryptId(accountData.account_id),
		});

		revalidatePath("/");
		return parseStringify({
			publicTokenExchange: "complete",
		});
	} catch (err) {
		console.log("An err occured");
	}
};
