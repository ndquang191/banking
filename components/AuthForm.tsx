"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authFormSchema } from "@/lib/utils";
import FormInput from "./FormInput";
import { CookingPot, Loader, Loader2, LucideCircleGauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLoggedInUser, signIn, signUp } from "@/lib/actions/user.actions";
import PlaidLink from "./PlaidLink";

const AuthForm = ({ type }: AuthFormProps) => {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const formSchema = authFormSchema(type);
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// 2. Define a submit handler.
	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			if (type == "sign-up") {
				const userData = {
					firstName: data.firstName!,
					lastName: data.lastName!,
					address1: data.address1!,
					city: data.city!,
					state: data.state!,
					postalCode: data.postalCode!,
					dateOfBirth: data.dateOfBirth!,
					ssn: data.ssn!,
					email: data.email,
					password: data.password,
				};
				const newUser = await signUp(userData);
				setUser(newUser);
			}
			if (type == "sign-in") {
				const response = await signIn({
					email: data.email,
					password: data.password,
				});

				if (response) router.push("/");
			}
		} catch (err) {
			console.log(err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<section id="auth-form" className="auth-form">
				<header className="flex flex-col gap-5 md:gap-8">
					<Link href={"/"} className=" cursor-pointer items-center gap-1 px-4 flex">
						<Image
							src="/icons/logo.svg"
							width={34}
							height={34}
							alt="Logo"
							className="size-[24px] max-xl:size-14"
						/>
						<h1 className="text-[26px] font-ibm-plex-serif text-black-1 font-semibold">
							Horizon
						</h1>
					</Link>

					<div className="flex flex-col gap-1 md:gap-3">
						<h1 className="text-24 lg:text-36 font-semibold text-gray-900">
							{user ? "Link Account" : type == "sign-in" ? "Sign In" : "Sign Up"}{" "}
						</h1>

						<p className="text-16 font-normal text-gray-600">
							{user ? "Link  your account " : "Please enter your details"}
						</p>
					</div>
				</header>
				{user ? (
					<div className="flex flex-col gap-4">
						<PlaidLink user={user} variant="primary" />
					</div>
				) : (
					<>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								{type == "sign-up" && (
									<>
										<div className="flex gap-4">
											<FormInput
												name="firstName"
												control={form.control}
												label="First Name"
												placeholder=""
											/>
											<FormInput
												name="lastName"
												control={form.control}
												label="Last Name"
												placeholder=""
											/>
										</div>
										<FormInput
											name="address1"
											control={form.control}
											label="Address"
											placeholder=""
										/>
										<FormInput
											name="city"
											control={form.control}
											label="City"
											placeholder=""
										/>
										<div className="flex gap-4">
											<FormInput
												name="state"
												control={form.control}
												label="State"
												placeholder=""
											/>
											<FormInput
												name="postalCode"
												control={form.control}
												label="Postal Code"
												placeholder=""
											/>
										</div>
										<div className="flex gap-4">
											<FormInput
												name="dateOfBirth"
												control={form.control}
												label="Date of birth "
												placeholder=""
											/>
											<FormInput
												name="ssn"
												control={form.control}
												label="SSN "
												placeholder=""
											/>
										</div>
									</>
								)}
								<FormInput
									name="email"
									control={form.control}
									label="Email"
									placeholder="Enter your email"
								/>

								<FormInput
									name="password"
									control={form.control}
									label="Password"
									placeholder="Enter your password"
								/>
								<div className="flex flex-col gap-4">
									<Button type="submit" className="form-btn" disabled={isLoading}>
										{isLoading ? (
											<>
												<Loader2 size={20} className="animate-spin" />{" "}
												&nbsp; Loading...
											</>
										) : type == "sign-in" ? (
											"Sign In"
										) : (
											"Sign Up"
										)}
									</Button>
								</div>
							</form>
						</Form>
						<footer className="flex justify-center gap-1">
							<p className="text-14 font-normal text-gray-600">
								{type == "sign-in"
									? "Don't have a account"
									: "Already have a account"}
							</p>
							<Link
								href={type == "sign-in" ? "/sign-up" : "/sign-in"}
								className="form-link"
							>
								{type == "sign-in" ? "Sign up" : "Sign in"}
							</Link>
						</footer>
					</>
				)}
			</section>
		</>
	);
};

export default AuthForm;
