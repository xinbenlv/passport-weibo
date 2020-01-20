/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Weibo authentication strategy authenticates requests by delegating to
 * Weibo using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Weibo application's Client ID
 *   - `clientSecret`  your Weibo application's Client Secret
 *   - `callbackURL`   URL to which Weibo will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://open.weibo.com/wiki/Oauth/en#User_Authentication for more info)
 *
 * Examples:
 *
 *     passport.use(new WeiboStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/weibo/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.weibo.com/oauth2/authorize';
  options.tokenURL = options.tokenURL || 'https://api.weibo.com/oauth2/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};
  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-weibo';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'weibo';
  this._getuidAPI = options.getuidAPI || 'https://api.weibo.com/2/account/get_uid.json';
  this._getProfileAPI = options.getProfileAPI || 'https://api.weibo.com/2/users/show.json';

}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Weibo.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `weibo`
 *   - `id`               the user's Weibo ID
 *   - `username`         the user's Weibo username
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Weibo
 *   - `emails`           the user's email addresses
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, callback) {
    var self = this;
    this._oauth2.getProtectedResource(this._getuidAPI, accessToken, function(err, body, res) {
        if (err) return callback(new InternalOAuthError('', err));

        try {
            var raw = JSON.parse(body);
            self._oauth2.getProtectedResource(self._getProfileAPI + '?uid=' + raw.uid, accessToken, function(err, body, res) {
                if (err) return callback(new InternalOAuthError('', err));

                try {
                  callback(null, self.formatProfile(JSON.parse(body))); // this is different with raw.
                } catch(e) {
                  callback(e);
                }
            })
        } catch(e) {
            callback(e);
        }
    })
}

Strategy.prototype.formatProfile = function(raw) {
    var user = {};
    user.provider = 'weibo';
    user.id = raw.idstr;
    user.displayName = raw.screen_name || raw.name;
    user._raw = raw;
    user._json = raw;

    return user;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
