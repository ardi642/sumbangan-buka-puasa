import {Sequelize, DataTypes, Model} from 'sequelize'
import sequelize from '../Connection.js';

class Akun extends Model {}

Akun.init({
  username : {
    type : DataTypes.STRING(30),
    primaryKey : true,
  },
  password : {
    type : DataTypes.STRING(30),
    allowNull : false,
  },
  nama : {
    type : DataTypes.STRING(30),
    allowNull : false,
  }
}, {sequelize, tableName : 'akun', timestamps : true});

export default Akun;