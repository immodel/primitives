var expect = require('chai').expect;
var model = require('immodel').bootstrap({types: require('../')});

describe('types', function() {
  describe('array', function() {
    var array = model.lookup('array');

    it('should work', function() {
      var User = model
        .attr('groups', array('string'));

      var user = new User();

      expect(user.get('groups').length).to.equal(0);
      user.get('groups').push('test');
      expect(user.get('groups.0')).to.equal('test');
      expect(user.get('groups')[0]).to.equal('test');
      expect(user.get('groups').length).to.equal(1); 
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
      user.get('groups').push({id: 1, displayName: 'model group'});
      expect(user.get('groups')[0].get('displayName')).to.equal('model group');
      expect(user.get('groups.0.displayName')).to.equal('model group');
      expect(user.get('groups.0').get('displayName')).to.equal('model group');

      // Splice
      user.get('groups').splice(1, 0, {id: 2, displayName: 'dobis'});
      expect(user.get('groups')[1].get('displayName')).to.equal('dobis');
      expect(user.get('groups').length).to.equal(2);

      // Pop
      user.get('groups').pop();
      expect(user.get('groups').length).to.equal(1);

      // Make sure it popped the right one
      expect(user.get('groups.0.displayName')).to.equal('model group');
    });

    it('should work with validation', function(done) {
      var User = model
      .attr('groups', {
        type: array('string'),
        required: true
      });

      var user = new User();
      user.validate(function(err) {
        expect(err).not.to.be.null;
        expect(err[0].key).to.equal('required');
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
      share.get('attachments').push({objectType: 'question'});

      expect(share.get('attachments.0.questionText')).to.equal('');
      expect(share.get('attachments.0.url')).to.equal(undefined);

      share.get('attachments').push({objectType: 'video'});

      expect(share.get('attachments.1.questionText')).to.equal(undefined);
      expect(share.get('attachments.1.url')).to.equal(''); 
    }); 
  });
});