import z from "@/node_modules/zod/v4/classic/external.cjs";

export type FormResults<T> = {
	errors?: {
		formErrors?: string[];
		fieldErrors?: {
			[K in keyof T]?: string[];
		};
	};
	success?: string;
};export type InvitationStatus = {
	authenticated: boolean;
	needsInvitation: boolean;
	invitationAcceptedAt?: Date | null;
};
export const validateInvitationCodeSchema = z.object({
	code: z.string().trim().toUpperCase().regex(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/, "Invalid code format. Expected format: XXXX-XXXX-XXXX"),
});

