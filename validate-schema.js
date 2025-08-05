const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'data.json');
const schemaFilePath = path.join(__dirname, 'data.schema.json');
const ajv = new Ajv({ allErrors: true, verbose: true });

let data;
let schema;

try {
  data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
} catch (error) {
  console.error(`Error reading or parsing data.json: ${error.message}`);
  process.exit(1);
}

try {
  schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
} catch (error) {
  console.error(`Error reading or parsing data.schema.json: ${error.message}`);
  process.exit(1);
}

const validate = ajv.compile(schema);
const isValid = validate(data);

if (!isValid) {
  console.error('Validation failed for data.json:');
  if (validate.errors) {
    validate.errors.forEach((err) => {
      console.error(`- ${err.instancePath || '(root)'} ${err.message}`);
      if (err.params) {
        console.error(`  Params: ${JSON.stringify(err.params)}`);
      }
    });
  }
  process.exit(1);
} else {
  console.log('data.json is valid according to data.schema.json.');
  process.exit(0);
}
