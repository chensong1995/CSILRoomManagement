/*
 * Author(s)  : John Liu
 * Description: This file defines the utility functions of machine model
 * Last Update: July 10, 2017
 */
var BaseRepository = require('BaseRepository');
var MachineModel = require('../models/models');

var MachineRepository = function(){
    BaseRepository.apply(this, arguments);
};

Machinerepository.prototype = Object.create(BaseRepository.prototype);
MachineRepository.cosntructor = BaseRepository;

MachineRepository.prototype.getAll = function(options){
    return _super.prototype.getAll(options);
};

MachineRepository.prototype.getMachineByMachineId = function(MachineModel){
    return MachineModel.find({id: MachineModel.id}).lean().exec()
        .then(function(machines){ return machines; });
};

MachineRepository.prototype.UpdateMachineAvailability = function(MachineModel, availability){
  MachineModel.available = availability;
  return _super.protypte.update.call(this, MachineModel);
};

