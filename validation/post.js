const isEmpty = require("./is-empty");
const validator = require("validator");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 30, max: 300 })) {
    errors.text = "Post must be between 30 to 300 characters";
  }

  if (validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }
  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
