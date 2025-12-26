CREATE TABLE `invitations` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`created_by` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`used_by` integer,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`used_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_code_unique` ON `invitations` (`code`);--> statement-breakpoint
CREATE INDEX `invitations_code_idx` ON `invitations` (`code`);--> statement-breakpoint
CREATE INDEX `invitations_expires_at_idx` ON `invitations` (`expires_at`);