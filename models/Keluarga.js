import {Sequelize, DataTypes, Model} from 'sequelize'
import sequelize from '../Connection.js';
import DetailBlok from './DetailBlok.js';

class Keluarga extends Model {}

Keluarga.init({
  id_keluarga : {
    type : DataTypes.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  wakil_keluarga : {
    type : DataTypes.STRING(50),
    allowNull : false
  },
  id_detail_blok : {
    type : DataTypes.INTEGER,
    allowNull : false,
    unique : 'alamat',
    references : {
      model : DetailBlok,
      key : 'id_detail_blok'
    }
  },
  no_rumah : {
    type : DataTypes.TINYINT(4),
    unique : 'alamat',
    allowNull : true,
  }
}, {sequelize, tableName : 'keluarga', timestamps : true});

DetailBlok.hasOne(Keluarga, {foreignKey : 'id_detail_blok', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
Keluarga.belongsTo(DetailBlok, {foreignKey : 'id_detail_blok'});

export default Keluarga;