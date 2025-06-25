// import express from "express";
// import jwt from "jsonwebtoken";
// import passport from "passport";

// const router = express.Router();

// // ==============================
// // GOOGLE AUTH
// // ==============================
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     session: false,
//   })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//     failureRedirect: `${process.env.CLIENT_URL}/login`,
//   }),
//   (req, res) => {
//     const user = req.user;
//     if (!user) {
//       return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // ✅ Redirect user to frontend with JWT token
//     res.redirect(`${process.env.CLIENT_URL}/social-login?token=${token}`);
//   }
// );

// // ==============================
// // FACEBOOK AUTH
// // ==============================
// router.get(
//   "/facebook",
//   passport.authenticate("facebook", {
//     scope: ["email"],
//     session: false,
//   })
// );

// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", {
//     session: false,
//     failureRedirect: `${process.env.CLIENT_URL}/login`,
//   }),
//   (req, res) => {
//     const user = req.user;
//     if (!user) {
//       return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
//     }

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.redirect(`${process.env.CLIENT_URL}/social-login?token=${token}`);
//   }
// );

// export default router;
