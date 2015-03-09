var assert = require('assert');
var model = require('immodel')
  .use(require('immodel-base'), {primitives: require('..')});

describe('primitives', function() {
  describe('array', function() {
    var array = model.lookup('array');

    it('should work', function() {
      var User = model
        .attr('groups', array('string'));

      var user = new User();

      assert(user.get('groups').length === 0);
      user = user.set('groups', user.get('groups').push('test'));

      assert(user.get('groups.0').value === 'test');
      assert(user.get('groups')[0].value === 'test');
      assert(user.get('groups').length === 1);
    });

    it('should work with complex objects', function() {
      var User = model
        .attr('groups', array('group'));

      model
        .attr('id', 'number')
        .attr('displayName', 'string')
        .type('group');

      var user = new User();

      // Push
      user = user.set('groups', user.get('groups').push({id: 1, displayName: 'model group'}));
      assert(user.get('groups')[0].get('displayName').value === 'model group');
      assert(user.get('groups.0.displayName').value === 'model group');
      assert(user.get('groups.0').get('displayName').value === 'model group');

      // Splice
      user = user.set('groups', user.get('groups').splice(1, 0, {id: 2, displayName: 'dobis'}));
      assert(user.get('groups')[1].get('displayName').value === 'dobis');
      assert(user.get('groups').length === 2);

      // Pop
      user = user.set('groups', user.get('groups').pop());
      assert(user.get('groups').length === 1);

      // Make sure it popped the right one
      assert(user.get('groups.0.displayName').value === 'model group');
    });

    it('should work with validation', function(done) {
      var User = model
      .attr('groups', {
        type: array('string'),
        required: true
      });

      var user = new User();
      user.validate(function(err) {
        assert(err !== null);
        assert(err.key, 'required');
        done();
      });
    });

    it('should work with discriminators', function() {
      var Share = model
        .attr('attachments', array('object'));

      var Obj = model
        .attr('objectType', 'string')
        .discriminator('objectType', ['question', 'video'])
        .type('object');

      Obj
        .attr('questionText', 'string')
        .type('question');

      Obj
        .attr('url', 'string')
        .type('video');

      var share = new Share();
      share = share.set('attachments', share.get('attachments').push({objectType: 'question'}));

      assert(share.get('attachments.0.questionText').value === '');
      assert(share.get('attachments.0.url').value === undefined);

      share = share.set('attachments', share.get('attachments').push({objectType: 'video'}));

      assert(share.get('attachments.1.questionText').value === undefined);
      assert(share.get('attachments.1.url').value === '');
    });
  });
});