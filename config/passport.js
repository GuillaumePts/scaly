const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Ton modèle d'utilisateur

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Ta clé client
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ton secret client
    callbackURL: "/auth/google/callback" // URL de redirection après l'authentification
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Chercher un utilisateur existant dans ta base de données
        let user = await User.findOne({ googleId: profile.id });

        // Si l'utilisateur n'existe pas, crée-le
        if (!user) {
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value,
                isVerified: true, // On peut aussi vérifier l'email via l'API Google
            });
            await user.save(); // Enregistrer l'utilisateur dans la BDD
        }

        // Retourner l'utilisateur authentifié
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

module.exports = passport;

