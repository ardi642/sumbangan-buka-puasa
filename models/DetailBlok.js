import {Sequelize, DataTypes, Model} from 'sequelize'
import sequelize from '../Connection.js';
import Blok from './Blok.js';

class DetailBlok extends Model {}

DetailBlok.init({
  id_detail_blok : {
    type : DataTypes.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  id_blok : {
    type : DataTypes.INTEGER,
    allowNull: false,
    unique: 'blok_sublok',
    references : {
      model : Blok,
      foreignKey : 'id_blok'
    }
  },
  sub_blok : {
    type : DataTypes.CHAR(2),
    allowNull : false,
    defaultValue : '',
    unique : 'blok_sublok'
  }
}, {sequelize, tableName : 'detail_blok', timestamps : true});

Blok.hasMany(DetailBlok, {foreignKey : 'id_blok', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
DetailBlok.belongsTo(Blok, {foreignKey : 'id_blok'});

export default DetailBlok;