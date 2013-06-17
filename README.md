# Passport-Weibo

copied and revised from passport-weibo

[Passport](http://passportjs.org/) strategy for authenticating with [Weibo](https://weibo.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Weibo in your Node.js applications.
By plugging into Passport, Weibo authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-weibo

## Usage

#### Configure Strategy

The Weibo authentication strategy authenticates users using a Weibo account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

    passport.use(new WeiboStrategy({
        clientID: WEIBO_CLIENT_ID,
        clientSecret: WEIBO_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/weibo/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ weiboId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'weibo'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/weibo',
      passport.authenticate('weibo'));

    app.get('/auth/weibo/callback', 
      passport.authenticate('weibo', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/xinbenlv/passport-weibo/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/xinbenlv/passport-weibo.png)](http://travis-ci.org/xinbenlv/passport-weibo)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)
  - [Zainan Victor Zhou](http://github.com/xinbenv)


## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Zainan Victor Zhou <[http://zzn.im/](http://www.zzn.im/)>

