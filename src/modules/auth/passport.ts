import passport from "passport";
import { Strategy as GoogleStrategy, type Profile } from "passport-google-oauth20";
import type { AppConfig } from "../../config/index.js";
import { AppError } from "../../lib/app-error.js";
import type { OAuthProfileInput } from "./auth.types.js";

export function configurePassport(config: AppConfig["auth"]) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
        scope: ["profile", "email"],
      },
      (_accessToken, _refreshToken, profile, done) => {
        try {
          done(null, normalizeGoogleProfile(profile));
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  return passport.initialize();
}

function normalizeGoogleProfile(profile: Profile): OAuthProfileInput {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new AppError(422, "GOOGLE_EMAIL_REQUIRED", "Google account email is required");
  }

  return {
    provider: "google",
    providerAccountId: profile.id,
    email: email.toLowerCase(),
    name: profile.displayName || email,
    avatarUrl: profile.photos?.[0]?.value ?? null,
    emailVerified: true,
  };
}
