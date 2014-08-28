var vows = require('vows');
var assert = require('assert');
var util = require('util');
var WeiboStrategy = require('passport-weibo/strategy');


vows.describe('WeiboStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named weibo': function (strategy) {
      assert.equal(strategy.name, 'weibo');
    },
    'should have default user agent': function (strategy) {
      assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'passport-weibo');
    },
  },
  
  'strategy with user agent option': {
    topic: function() {
      return new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        userAgent: 'example.com'
      },
      function() {});
    },
    
    'should have correct user agent': function (strategy) {
      assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example.com');
    },
  },
  
  'strategy with user agent option in custom headers': {
    topic: function() {
      return new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        customHeaders: { 'User-Agent': 'example2.com' }
      },
      function() {});
    },
    
    'should have correct user agent': function (strategy) {
      assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example2.com');
    },
  },
  
  'strategy with user agent option in custom headers and explicit option': {
    topic: function() {
      return new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        customHeaders: { 'User-Agent': 'example2.com' },
        userAgent: 'example3.com'
      },
      function() {});
    },
    
    'should prefer custom headers': function (strategy) {
      assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example2.com');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.getProtectedResource = function (url, accessToken, callback) {
        if (url === 'https://api.weibo.com/2/account/get_uid.json') {
          var body = '{ "uid": 1 }'; 
          callback(null, body, undefined);
        } else if (url === 'https://api.weibo.com/2/users/show.json?uid=1') {
          var body = '{ "idstr": "1", "screen_name": "monalisa octocat" }';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL:' + url));
        }
      }
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'weibo');
        assert.equal(profile.id, '1');
        assert.equal(profile.displayName, 'monalisa octocat');
      },
      'should set raw property' : function(err, profile) {
        assert.isObject(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
   
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new WeiboStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
