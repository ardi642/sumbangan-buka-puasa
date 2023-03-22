import {Sequelize, DataTypes, Model} from 'sequelize'
import sequelize from '../Connection.js';
import Keluarga from './Keluarga.js';

class Sumbangan extends Model {}

Sumbangan.init({
  id_sumbangan : {
    type : DataTypes.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  id_keluarga : {
    type : DataTypes.INTEGER,
    allowNull : false,
    references : {
      model : Keluarga,
      foreignKey : 'id_keluarga'
    }
  },
  nominal : {
    type : DataTypes.INTEGER,
    allowNull : true,
  },
  suguhan : {
    type: DataTypes.ENUM('ya', 'tidak'),
    allowNull : false
  },
  keterangan: {
    type: DataTypes.TEXT('tiny'),
    allowNull: true,
    defaultValue: null
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {sequelize, tableName : 'sumbangan', timestamps : true, freezeTableName: true});

Keluarga.hasMany(Sumbangan, {foreignKey : 'id_keluarga',  onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
Sumbangan.belongsTo(Keluarga, {foreignKey : 'id_keluarga'});

export default Sumbangan;