import React from "react";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");
interface FormInput {
	control: Control<z.infer<typeof formSchema>>;
	name: FieldPath<z.infer<typeof formSchema>>;
	label: string;
	placeholder: string;
}

const FormInput = ({ control, name, label, placeholder }: FormInput) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<div className="form-item">
					<FormLabel className="form-label">{label}</FormLabel>
					<div className="flex w-full flex-col">
						<FormControl>
							<Input
								id={name}
								className="input-class"
								placeholder={placeholder}
								type={name === "password" ? "password" : "text"}
								{...field}
							></Input>
						</FormControl>
						<FormMessage className="form-message mt-2"></FormMessage>
					</div>
				</div>
			)}
		/>
	);
};

export default FormInput;
