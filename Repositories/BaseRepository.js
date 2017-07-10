var BaseRepository = function(){
    function BaseRepoisitory(model){
        this.model = model;
    }

    BaseRepository.prototype.getAll = function(options) {
        var _this = this;
        var promise = this.model.find();

        return promise.lean().exec()
            .then(function (res){
                return _this.getModels(res);
            });
    }

    BaseRepository.prototype.getById = function(id){
        var _this = this;
        return this.model.findById(id).lean.exec()
            .then(function(res){
                return _this.getModel(res);
            });
    }

    BaseRepository.prototype.findOne = function(query){
        var _this = this;
        return this.model.findOne(query).lean.exec()
            .then(function(res){
                return _this.getModel(res);
            });
    }

    BaseRepository.prototype.create = function(obj){
        var _this = this;
        delete obj._id;
        return this.model.create(obj)
            .then(function(res){
                return _this.getModel(res);
            })
    }

    BaseRepoisitory.prototype.update = function(obj){
        var _this = this;
        return this.model.findByIdAndUpdate(obj._id, obj, {new: true}.exec()
            .then(function(res){
                return _this.getModel(res);
            }))
    }
}