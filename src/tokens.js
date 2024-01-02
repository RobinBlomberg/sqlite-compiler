/**
 * @typedef {import('./types.js').Token} Token
 */

/**
 * @param {string} value
 * @return {Token}
 */
export const Hex = (value) => {
  return {
    type: 'Hex',
    value,
  };
};

/**
 * @param {string} value
 * @return {Token}
 */
export const Identifier = (value) => {
  return {
    type: 'Identifier',
    value,
  };
};

/**
 * @param {string} value
 * @return {Token}
 */
export const Keyword = (value) => {
  return {
    type: 'Keyword',
    value,
  };
};

/**
 * @param {string} value
 * @return {Token}
 */
export const Numeric = (value) => {
  return {
    type: 'Numeric',
    value,
  };
};

/**
 * @param {string} value
 * @return {Token}
 */
export const Punctuator = (value) => {
  return {
    type: 'Punctuator',
    value,
  };
};

/**
 * @param {string} value
 * @return {Token}
 */
export const String = (value) => {
  return {
    type: 'String',
    value,
  };
};
