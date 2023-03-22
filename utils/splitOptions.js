export default function splitOptions(options, keys) {
  let extractedOptions = {};
  for (const key of keys) {
    if (options[key] === undefined) continue;
    extractedOptions[key] = options[key];
    delete options[key];
  }
  return extractedOptions;
}