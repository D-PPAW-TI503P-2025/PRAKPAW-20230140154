'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SensorLog extends Model {
    static associate(models) {
      // define association here
    }
  }

  SensorLog.init(
    {
      suhu: {
        type: DataTypes.FLOAT,
      },
      kelembaban: {
        type: DataTypes.FLOAT,
      },
      cahaya: {
        type: DataTypes.INTEGER,
      },
      motion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'SensorLog',
    }
  );

  return SensorLog;
};