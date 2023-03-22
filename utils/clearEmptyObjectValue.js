const constraintValues = {
  emptyString : '',
  nullable : null
}

function mergeDefaults(constraints) {
  constraints.nullable = constraints.nullable ?? 'deleted';
  constraints.emptyString = constraints.emptyString ?? 'notDeleted';
  return constraints;
}

function clearEmptyObjectValue(obj, options = {}) {
  let value, constraints, isDeleted;
  for (const key in obj) {
    if ( Object.hasOwnProperty.call(obj, key) ) {
      value = obj[key];

      if (typeof(value) == 'string' &&
        value.toLowerCase() == 'null') 
        value = obj[key] = null;
      
      if (typeof value == 'object' && !Array.isArray(value) && 
          value !== null)
        clearEmptyObjectValue(value, options);

      else if (key in options) {
        constraints = mergeDefaults(options[key]);
        for (const constraint in constraints) {
          if (Object.hasOwnProperty.call(constraints, constraint)) {
            if (constraints[constraint] == 'deleted')
              isDeleted = true
            else if (constraints[constraint] == 'notDeleted')
              isDeleted = false
            else continue;

            if (value === constraintValues[constraint] && isDeleted)
              delete obj[key];
              break;
          }
          
        }

      }
      
    }
  }
  return obj;
}

export default clearEmptyObjectValue;


/*
contoh penggunaan
  // const query = clearEmptyObjectValue(req.query, {
  //   sub_blok : {
  //     emptyString : 'deleted',
  //     nullable : 'notDeleted'
  //   }
  default nullable : deleted, emptyString : notDeleted
*/