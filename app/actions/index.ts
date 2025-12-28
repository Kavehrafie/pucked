"use server"
import * as AuthActions from "./auth";
import * as InvitationActions from "./invitations";

export const  {checkInvitationStatus, submitInvitation} = InvitationActions
export const {loginWithGitHub, logout} = AuthActions

