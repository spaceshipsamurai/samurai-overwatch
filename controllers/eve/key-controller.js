var KeyService = require('../../services').KeyService;

exports.validateBatch = function(req, res, next) {
    var batchSize = req.params.count || 5;
    KeyService.validateBatch(batchSize);
    res.json({ message: 'Batch Validation Started'});
};
