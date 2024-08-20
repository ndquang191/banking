"use server";

import path from "path";
import { createAdminClient, createSessionClient } from "../appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: { email: string; password: string }) => {
	try {
		const { account } = await createAdminClient();

		const response = await account.createEmailPasswordSession(email, password);

		return parseStringify(response);
	} catch (err) {
		console.log("err", err);
	}
};
export const signUp = async (userData: SignUpParams) => {
	try {
		const { account } = await createAdminClient();

		const newUserAccount = await account.create(
			ID.unique(),
			userData.email,
			userData.password,
			`${userData.firstName} ${userData.lastName}`
		);

		const session = await account.createEmailPasswordSession(userData.email, userData.password);

		cookies().set("appwrite-session", session.secret, {
			path: "/",
			httpOnly: true,
			sameSite: "strict",
		});

		return parseStringify(newUserAccount);
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
