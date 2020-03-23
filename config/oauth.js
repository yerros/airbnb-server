const domain = process.env.baseUrl;
const ids = {
  facebook: {
    clientID: process.env.fb_clientID,
    clientSecret: process.env.fb_clientSecret,
    callbackURL: domain + "/auth/facebook/callback"
  },
  google: {
    clientID: process.env.google_clientID,
    clientSecret: process.env.google_clientSecret,
    callbackURL: domain + "/auth/google/callback"
  },
  twitter: {
    consumerKey: "get_your_own",
    consumerSecret: "get_your_own",
    callbackURL: domain + "/auth/twitter/callback"
  },
  JWT: {
    secret: "BambangNakal"
  }
};
module.exports = ids;
