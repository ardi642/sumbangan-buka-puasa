import { Op } from "sequelize";

function stringToOperatorSymbol(str) {

  return Op[str.substring(3, str.length)];
}

export default function resolveSymbolOperator(obj) {
  let operatorSymbol, value;
  for (const key in obj) {
    if ( Object.hasOwnProperty.call(obj, key) ) {
      
      value = obj[key];
      if (typeof value == 'object')
        resolveSymbolOperator(value);

      if (key.startsWith('Op.')) {
        operatorSymbol = stringToOperatorSymbol(key);
        delete obj[key];
        obj[operatorSymbol] = value;
      }
      
    }
  }
  return obj;
}