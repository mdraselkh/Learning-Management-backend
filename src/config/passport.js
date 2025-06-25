// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as FacebookStrategy } from "passport-facebook";
// import passport from "passport";
// import dotenv from "dotenv";
// import { findOrCreateUser } from "../models/userModel.js"; // make sure to include `.js` if using ES Modules

// dotenv.config();

// // --- GOOGLE STRATEGY ---
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const user = await findOrCreateUser({
//           name: profile.displayName,
//           email: profile.emails?.[0]?.value,
//           image_url: profile.photos?.[0]?.value,
//           provider: "google",
//         });
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // --- FACEBOOK STRATEGY ---
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["id", "emails", "name", "picture.type(large)"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const user = await findOrCreateUser({
//           name: `${profile.name.givenName} ${profile.name.familyName}`,
//           email: profile.emails?.[0]?.value,
//           image_url: profile.photos?.[0]?.value,
//           provider: "facebook",
//         });
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// // ❌ REMOVE these because no session-based login is used
// // passport.serializeUser(...)
// // passport.deserializeUser(...)

// export default passport;
