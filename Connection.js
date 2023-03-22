import {Sequelize} from 'sequelize'
const sequelize = new Sequelize('masjid', 'root', '', {
  host : '127.0.0.1',
  dialect : 'mariadb',
  dialectOptions: {
    useUTC: false //for reading from database
  },
  timezone: '+08:00' //for writing to database
});

export default sequelize;