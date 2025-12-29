
export type FormResults<T, U> = {
	errors?: {
		formErrors?: string[];
		fieldErrors?: {
			[K in keyof T]?: string[];
		};
	};
	success?: string;
	data?: U;
};

export type InvitationStatus = {
	authenticated: boolean;
	needsInvitation: boolean;
	invitationAcceptedAt?: Date | null;
};
