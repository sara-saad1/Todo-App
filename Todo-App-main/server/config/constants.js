// I kept noticing I was copy-pasting the categories array in the model,
// the route validators, and the frontend too. Centralising them here means
// if a category ever needs to be added or renamed, there's only one place to touch.

const TASK_CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Finance',
  'Other',
];

// These limits are defined once here and imported wherever validation happens.
// That way the model and the route validator always agree on the same numbers.
const MAX_TITLE_LENGTH = 200;
const MAX_DESC_LENGTH = 1000;

module.exports = { TASK_CATEGORIES, MAX_TITLE_LENGTH, MAX_DESC_LENGTH };
