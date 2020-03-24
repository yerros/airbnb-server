const passport = require("passport");
const config = require("./oauth");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
const { generateToken, setUser } = require("../helper");
const secretOrKey = config.JWT.secret;

passport.serializeUser((user, done) => {
  console.log(user);

  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

//Facebook Configuration
passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      profileFields: ["id", "emails", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(async () => {
        const fb_profile = profile._json;
        let user = await User.findOne({ email: fb_profile.email });
        if (user !== null) {
          const token = generateToken(setUser(user));
          await User.findOneAndUpdate(
            { email: fb_profile.email },
            { $set: { token: token } }
          );
          return done(null, user);
        }
        user = new User({
          firstname: fb_profile.first_name,
          lastname: fb_profile.last_name,
          email: fb_profile.email
        });
        await user.save();
        return done(null, user);
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(async () => {
        const google_profile = profile._json;
        let user = await User.findOne({ email: google_profile.email });
        if (user !== null) {
          const token = generateToken(setUser(user));
          await User.findOneAndUpdate(
            { email: google_profile.email },
            { $set: { token: token } }
          );
          return done(null, user);
        }
        user = new User({
          firstname: google_profile.given_name,
          lastname: google_profile.family_name,
          email: google_profile.email
        });
        await user.save();
        return done(null, user);
      });
    }
  )
);

// Option Jwt
const opts = {
  jwtFromRequest,
  secretOrKey
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    const user = await User.findOne({ _id: jwt_payload._id });
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  })
);

module.exports = passport;
