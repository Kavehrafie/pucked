DROP INDEX `invitations_code_idx`;--> statement-breakpoint
DROP INDEX `invitations_expires_at_idx`;--> statement-breakpoint
ALTER TABLE `users` ADD `invitation_accepted_at` integer;