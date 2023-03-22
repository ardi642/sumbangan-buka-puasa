import {Sequelize, DataTypes, Model} from 'sequelize'
import sequelize from '../Connection.js';

class Blok extends Model {}

Blok.init({
  id_blok : {
    type : DataTypes.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  nama_blok : {
    type : DataTypes.STRING(30),
    allowNull : false,
    unique : true
  }
}, {sequelize, tableName : 'blok', timestamps : true});

export default Blok;