import { Op } from "sequelize";

function objectToWhere(obj, {defaultOperator = Op.substring, customOperators = {} }) {
  const where = {};
  let nilai;
  for (const kolom in obj) {
    nilai = obj[kolom];
    if (kolom in customOperators) 
      where[kolom] = { [customOperators[kolom]] : nilai }
    else where[kolom] = { [defaultOperator] : nilai }
  }
  return where;
}

export default objectToWhere;