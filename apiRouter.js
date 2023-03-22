import express from 'express';
import authorizationMiddleware from './middleware/authorizationMiddleware.js';
import clearEmptyObjectValue from './utils/clearEmptyObjectValue.js';
import resolveSymbolOperator from './utils/resolveSymbolOperator.js';

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import DetailBlok from './models/DetailBlok.js';
import Keluarga from './models/Keluarga.js';
import Sumbangan from './models/Sumbangan.js';
import Akun from './models/Akun.js';
import Blok from './models/Blok.js';
import sequelize from './Connection.js';
import splitOptions from './utils/splitOptions.js';
import { Op } from 'sequelize';

dotenv.config();
const tokenSecret = process.env.TOKEN_SECRET;


const apiRouter = express.Router();
apiRouter.all('/*', authorizationMiddleware);
apiRouter.post('/login', async function (req, res)  {
  let dataLogin, dataAkun;
  try {
    dataLogin = req.body;
    dataAkun = await Akun.findOne({
      where : {
        username: dataLogin.username,
      },
      attributes : {
        exclude : ['createdAt', 'updatedAt', 'deletedAt']
      }
    });
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error
      })
    return;
  }
  
  if (dataAkun == null || dataAkun.password != dataLogin.password) {
    const error = {};
    if (dataAkun == null)
      error.username = "Username tidak tersedia";
    else if (dataAkun.password != dataLogin.password)
      error.password = "password yang dimasukkan tidak sesuai";

    res
      .status(401)
      .json({
        error: error,
      });
    return;
  }
  dataAkun = dataAkun.dataValues;
  delete dataAkun['password'];

  const accessToken = jwt.sign(dataAkun, tokenSecret, {
    expiresIn: "14d"  // 14 hari
  });
  const decoded = jwt.verify(accessToken, tokenSecret);
  res
  .status(200)
  .cookie('jwt', accessToken, {
    httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 1 * 60 * 60 * 24 * 14  // 14 hari
    })
  .json({
    token: accessToken,
    data: decoded
  });
});

// mengambil informasi token dari httpOnly cookies
// dan menyimpannya ke dalam Component React js AuthProvider
apiRouter.get('/token', async (req, res) => {
  let receivedToken, decoded;
  try {
    receivedToken = req.cookies.jwt;
    decoded = jwt.verify(receivedToken, tokenSecret);
    res
    .status(200)
    .json({
      token: receivedToken,
      data: decoded
    });
  }
  catch (error) {
    res
      .status(401)
      .json({error: "jwt tidak ada"})
  }
} )

apiRouter.get('/logout', async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  res.json(true);
})

apiRouter.get('/blok', async (req, res) => {
  const query = clearEmptyObjectValue(req.query);
  const exclude = ['createdAt', 'updatedAt', 'deletedAt']
  const filter = resolveSymbolOperator(query);
  try {
    const data = await Blok.findAll({
      attributes: {
        exclude: exclude
      },
      where: filter,
      order: [[sequelize.col('nama_blok'), 'ASC']]
    })
    res.json({
      data : data
    });
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.post('/blok', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const blok = await Blok.create(req.body);
    const detailBlok = await DetailBlok.create({
      id_blok: blok.id_blok,
      sub_blok: ''
    });

    await t.commit();

    res
      .status(200)
      .json({
        data : {
          blok: blok,
          detailBlok: detailBlok
        }
      })
  }
  catch (error) {
    t.rollback();
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.put('/blok', async (req, res) => {
  const body = req.body;
  const idBlok = body.id_blok;
  delete body.id_blok;
  try {
    const data = await Blok.update({
      ...body
    }, 
    {
      where: {
        id_blok: idBlok
      }
    }
    );
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.delete('/blok', async (req, res) => {
  try {
    const count = await Blok.destroy({
      where: {
        id_blok: req.body.id_blok
      }
    });
    res
      .status(200)
      .json(true)
  }
  catch (error) {
    // console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
})

apiRouter.get('/detail-blok', async (req, res) => {
  let query = clearEmptyObjectValue(req.query);
  query = resolveSymbolOperator(query);
  
  const exclude = ['createdAt', 'updatedAt', 'deletedAt']
  const filter =  query;
  const filterBlok = query.Blok ?? {};
  
  delete query.Blok;

  try {
    const data = await DetailBlok.findAll({
      required: true,
      attributes: { exclude: exclude, },
      include: {
        model: Blok,
        required: true,
        attributes: { exclude: exclude },
        where: filterBlok
      },
      where: filter,
      order: [[sequelize.col('Blok.nama_blok'), 'ASC'],
              [sequelize.col('sub_blok'), 'ASC']]
    })
    res.json({
      data : data
    });
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.post('/detail-blok', async (req, res) => {
  try {
    const data = await DetailBlok.create(req.body);
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.put('/detail-blok', async (req, res) => {
  const body = req.body;
  const idDetailBlok = body.id_detail_blok;
  delete body.id_detail_blok;
  try {
    const data = await DetailBlok.update({
      ...body
    }, 
    {
      where: {
        id_detail_blok: idDetailBlok
      }
    }
    );
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.delete('/detail-blok', async (req, res) => {
  const t = await sequelize.transaction();

  try {
    let deletedBlok = 0, deletedDetailBlok = 0;
    const jumlahBlok = await DetailBlok.count({
      where: {
        id_blok: req.body.id_blok
      }
    });

    deletedDetailBlok = await DetailBlok.destroy({
      where: {
        id_detail_blok: req.body.id_detail_blok
      }
    })

    if (jumlahBlok == 1) {
      deletedBlok = await Blok.destroy({
        where: {
          id_blok: req.body.id_blok
        }
      });
    }
    
    await t.commit();
    res
      .status(200)
      .json({
        data: {deletedBlok, deletedDetailBlok}
      })
  }
  catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({
        error: error
      })
  }
})

apiRouter.get('/keluarga', async (req, res) => {
  let query = clearEmptyObjectValue(req.query, {
    id_keluarga : { emptyString : 'deleted'}
  });
  let filter = resolveSymbolOperator(query);
  const exclude = ['createdAt', 'updatedAt', 'deletedAt']
  let filterDetailBlok = filter.DetailBlok ?? {};
  let filterBlok = filter.Blok ?? {}
  delete filter.DetailBlok;
  delete filter.Blok;
  try {
    const data_keluarga = await Keluarga.findAll({
      required : true,
      include : {
        model : DetailBlok,
        required : true,
        attributes : {
          exclude
        },
        where: filterDetailBlok,
        include : {
          model : Blok,
          required: true,
          attributes : {
            exclude
          },
          where: filterBlok
        }
      },
      attributes : {
        exclude
      },
      where: filter,
      order: [[sequelize.col('DetailBlok.Blok.nama_blok'), 'ASC'],
              [sequelize.col('DetailBlok.sub_blok'), 'ASC'],
              [sequelize.col('no_rumah'), 'ASC'],]
    })
    res.json({
      data : data_keluarga
    });
  }
  catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
})

apiRouter.post('/keluarga', async (req, res) => {
  try {
    const data = await Keluarga.create(req.body);
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.put('/keluarga', async (req, res) => {
  const body = req.body;
  const idKeluarga = body.id_keluarga;
  delete body.id_keluarga;
  try {
    const data = await Keluarga.update({
      ...body
    }, 
    {
      where: {
        id_keluarga: idKeluarga
      }
    }
    );
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.delete('/keluarga', async (req, res) => {
  console.log(req.body);
  try {
    const count = await Keluarga.destroy({
      where: {
        id_keluarga: req.body.id_keluarga
      }
    });
    res
      .status(200)
      .json(true)
  }
  catch (error) {
    // console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
})

apiRouter.get('/sumbangan', async (req, res) => {
  const exclude = [];
  let filter = resolveSymbolOperator(req.query);
  const filterTambahan = splitOptions(filter, ['Keluarga', 'DetailBlok', 'Blok']);
  const filterKeluarga = filterTambahan.Keluarga ?? {};
  const filterDetailBlok = filterTambahan.DetailBlok ?? {};
  const filterBlok = filterTambahan.Blok ?? {};

  const pagination = splitOptions(filter, ['limit, offset']);
  
  try {
    const data = await Sumbangan.findAll({
      ...pagination,
      attributes : {exclude},
      required : true,
      include : {
        model : Keluarga,
        attributes : {exclude},
        required : true,
        where: filterKeluarga,
        include : {
          model : DetailBlok,
          attributes : {exclude},
          required : true,
          where: filterDetailBlok,
          include: {
            model: Blok,
            attributes: {exclude},
            required: true,
            where: filterBlok
          }
        }
      },
      where: filter,
      order: [[sequelize.col('createdAt'), 'DESC']]
    })
    res.json({
      data : data
    });
  }
  catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
  


})

apiRouter.post('/sumbangan', async (req, res) => {
  try {
    const data = await Sumbangan.create(req.body);
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.put('/sumbangan', async (req, res) => {
  const body = req.body;
  const idSumbangan = body.id_sumbangan;
  delete body.id_sumbangan;

  try {
    const data = await Sumbangan.update({
      ...body
    }, 
    {
      where: {
        id_sumbangan: idSumbangan
      }
    }
    );
    res
      .status(200)
      .json({
        data : data
      })
  }
  catch (error) {
    res
      .status(500)
      .json({
        error: error,
      })
  }
})

apiRouter.delete('/sumbangan', async (req, res) => {
  console.log(req.body);
  try {
    const count = await Sumbangan.destroy({
      where: {
        id_sumbangan: req.body.id_sumbangan
      }
    });
    res
      .status(200)
      .json(true)
  }
  catch (error) {
    // console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
})

apiRouter.get('/sumbangan/belum-menyumbang', async (req, res) => {
  const exclude = [];
  let filter = resolveSymbolOperator(req.query);
  const filterTambahan = splitOptions(filter, ['DetailBlok', 'Blok']);
  const filterDetailBlok = filterTambahan.DetailBlok ?? {};
  const filterBlok = filterTambahan.Blok ?? {};
  const pagination = splitOptions(filter, ['limit, offset']);
  
  try {
    const data = await Keluarga.findAll({
      ...pagination,
      attributes : {exclude},
      include: {
        model: DetailBlok,
        required: true,
        attributes: ['sub_blok'],
        where: filterDetailBlok,
        include: {
          model: Blok,
          attributes: ['nama_blok'],
          where: filterBlok
        }
      },
      where: {
        ...filter,
        id_keluarga: {
          [Op.notIn]: sequelize.literal(
            `(SELECT id_keluarga FROM sumbangan)`
          )
        }
      },
      order: [[sequelize.col('createdAt'), 'DESC']]
    })
    res.json({
      data : data
    });
  }
  catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error: error
      })
  }
  


})

export default apiRouter;