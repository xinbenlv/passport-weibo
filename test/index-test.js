var vows = require('vows');
var assert = require('assert');
var util = require('util');
var weibo = require('passport-weibo');


vows.describe('passport-weibo').addBatch({

  'module': {
    'should report a version': function (x) {
      assert.isString(weibo.version);
    },
  },

}).export(module);
