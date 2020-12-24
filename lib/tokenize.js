/**
 * @typedef {import('./types').Token} Token
 */

import { AST } from '@robinblomberg/sqlite-ast';
import * as Tokens from './tokens.js';

const IF_EXISTS = [
  Tokens.Keyword('IF'),
  Tokens.Keyword('EXISTS')
];
const IF_NOT_EXISTS = [
  Tokens.Keyword('IF'),
  Tokens.Keyword('NOT'),
  Tokens.Keyword('EXISTS')
];

/**
 * @template T
 * @param {T[]} nodes
 * @param {(node: T) => Token[]} tokenizeNode
 * @return {Token[]}
 */
const _tokenizeCommaDelimitedList = (nodes, tokenizeNode) => {
  /** @type {Token[]} */
  const tokens = [];

  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) {
      tokens.push(Tokens.Punctuator(','));
    }

    tokens.push(...tokenizeNode(nodes[i]));
  }

  return tokens;
};

/**
 * @param {string} keywords
 * @return {Token[]}
 */
const _tokenizeKeywords = (keywords) => {
  return keywords.split(/\s+/).map(Tokens.Keyword);
};

/**
 * @param {AST._Path | AST._Identifier} node
 * @return {Token[]}
 */
const _tokenizePathLike = (node) => {
  return node.type === '_Path'
    ? tokenize_Path(node)
    : tokenize_Identifier(node);
};

/**
 * @param {AST._AddClause} node
 * @return {Token[]}
 */
export const tokenize_AddClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ADD'));
  tokens.push(...tokenizeColumnDef(node.columnDef));

  return tokens;
};

/**
 * @param {AST._AggregateArgs} node
 * @return {Token[]}
 */
export const tokenize_AggregateArgs = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.distinct) {
    tokens.push(Tokens.Keyword('DISTINCT'));
  }

  tokens.push(..._tokenizeCommaDelimitedList(node.expressions, tokenizeExpr));

  return tokens;
};

/**
 * @param {AST._AllColumnsClause} node
 * @return {Token[]}
 */
export const tokenize_AllColumnsClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.tableName));
  tokens.push(Tokens.Keyword('AS'));
  tokens.push(Tokens.Punctuator('*'));

  return tokens;
};

/**
 * @param {AST._AsClause} node
 * @return {Token[]}
 */
export const tokenize_AsClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.generatedAlways) {
    tokens.push(Tokens.Keyword('GENERATED'));
    tokens.push(Tokens.Keyword('ALWAYS'));
  }

  tokens.push(Tokens.Keyword('AS'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(...tokenizeExpr(node.as));
  tokens.push(Tokens.Punctuator(')'));

  if (node.mode !== null) {
    tokens.push(..._tokenizeKeywords(node.mode));
  }

  return tokens;
};

/**
 * @param {AST._BetweenExpression} node
 * @return {Token[]}
 */
export const tokenize_BetweenExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_BetweenExpression".');

  return tokens;
};

/**
 * @param {AST._BinaryExpression} node
 * @return {Token[]}
 */
export const tokenize_BinaryExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeExpr(node.left));

  if (/^[A-Z]+$/.test(node.operator)) {
    tokens.push(..._tokenizeKeywords(node.operator));
  } else {
    tokens.push(Tokens.Punctuator(node.operator));
  }

  tokens.push(...tokenizeExpr(node.right));

  return tokens;
};

/**
 * @param {AST._BindParameter} node
 * @return {Token[]}
 */
export const tokenize_BindParameter = (node) => {
  return tokenize_Identifier(node.bindParameter);
};

/**
 * @param {AST._BinaryKeywordExpression} node
 * @return {Token[]}
 */
export const tokenize_BinaryKeywordExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_BinaryKeywordExpression".');

  return tokens;
};

/**
 * @param {AST._BlobLiteral} node
 * @return {Token[]}
 */
export const tokenize_BlobLiteral = (node) => {
  return node.value.map((chunk) => {
    return Tokens.Hex(chunk);
  });
};

/**
 * @param {AST._CallExpression} node
 * @return {Token[]}
 */
export const tokenize_CallExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.functionName));
  tokens.push(Tokens.Punctuator('('));

  if (node.args === '*') {
    tokens.push(Tokens.Punctuator('*'));
  } else {
    tokens.push(..._tokenizeCommaDelimitedList(node.args, tokenizeExpr));
  }

  tokens.push(Tokens.Punctuator(')'));

  if (node.filter !== null) {
    tokens.push(...tokenizeFilterClause(node.filter));
  }

  if (node.over !== null) {
    tokens.push(...tokenizeOverClause(node.over));
  }

  return tokens;
};

/**
 * @param {AST._CaseExpression} node
 * @return {Token[]}
 */
export const tokenize_CaseExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_CaseExpression".');

  return tokens;
};

/**
 * @param {AST._CaseClause} node
 * @return {Token[]}
 */
export const tokenize_CaseClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_CaseClause".');

  return tokens;
};

/**
 * @param {AST._CastExpression} node
 * @return {Token[]}
 */
export const tokenize_CastExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_CastExpression".');

  return tokens;
};

/**
 * @param {AST._CheckClause} node
 * @return {Token[]}
 */
export const tokenize_CheckClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('CHECK'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(...tokenizeExpr(node.expr));
  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST._CheckConstraint} node
 * @return {Token[]}
 */
export const tokenize_CheckConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('CHECK'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(...tokenizeExpr(node.check));
  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST._CollateClause} node
 * @return {Token[]}
 */
export const tokenize_CollateClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('COLLATE'));
  tokens.push(...tokenize_Identifier(node.collationName));

  return tokens;
};

/**
 * @param {AST._CollateExpression} node
 * @return {Token[]}
 */
export const tokenize_CollateExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_CollateExpression".');

  return tokens;
};

/**
 * @param {AST._ColumnAliasClause} node
 * @return {Token[]}
 */
export const tokenize_ColumnAliasClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeExpr(node.expr));
  tokens.push(Tokens.Keyword('AS'));
  tokens.push(...tokenize_Identifier(node.as));

  return tokens;
};

/**
 * @param {AST._ColumnConstraintClause} node
 * @return {Token[]}
 */
export const tokenize_ColumnConstraintClause = (node) => {
  switch (node.type) {
    case '_PrimaryKeyClause':
      return tokenize_PrimaryKeyClause(node);
    case '_NotNullClause':
      return tokenize_NotNullClause(node);
    case '_UniqueClause':
      return tokenize_UniqueClause(node);
    case '_CheckClause':
      return tokenize_CheckClause(node);
    case '_DefaultClause':
      return tokenize_DefaultClause(node);
    case '_CollateClause':
      return tokenize_CollateClause(node);
    case 'ForeignKeyClause':
      return tokenizeForeignKeyClause(node);
    case '_AsClause':
      return tokenize_AsClause(node);
    default:
      throw new TypeError(
        `Unexpected column constraint clause type: ${/** @type {any} */ (node).type}`
      );
  }
};

/**
 * @param {AST._ColumnPath} node
 * @return {Token[]}
 */
export const tokenize_ColumnPath = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(..._tokenizePathLike(node.tablePath));
  tokens.push(Tokens.Punctuator('.'));
  tokens.push(...tokenize_Identifier(node.columnName));

  return tokens;
};

/**
 * @param {AST._ColumnSelectorClause} node
 * @return {Token[]}
 */
export const tokenize_ColumnSelectorClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.indexedColumns, tokenize_Identifier));
  tokens.push(Tokens.Punctuator(')'));

  if (node.where !== null) {
    tokens.push(Tokens.Keyword('WHERE'));
    tokens.push(...tokenizeExpr(node.where));
  }

  return tokens;
};

/**
 * @param {AST._DefaultClause} node
 * @return {Token[]}
 */
export const tokenize_DefaultClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('DEFAULT'));

  switch (node.expr.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
      tokens.push(...tokenizeExpr(node.expr));
      break;
    default:
      tokens.push(Tokens.Punctuator('('));
      tokens.push(...tokenizeExpr(node.expr));
      tokens.push(Tokens.Punctuator(')'));
      break;
  }

  return tokens;
};

/**
 * @param {AST._DeferrableClause} node
 * @return {Token[]}
 */
export const tokenize_DeferrableClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.negated) {
    tokens.push(Tokens.Keyword('NOT'));
  }

  tokens.push(Tokens.Keyword('DEFERRABLE'));

  if (node.initially) {
    tokens.push(Tokens.Keyword('INITIALLY'));
    tokens.push(..._tokenizeKeywords(node.initially));
  }

  return tokens;
};

/**
 * @param {AST._ExistsExpression} node
 * @return {Token[]}
 */
export const tokenize_ExistsExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_ExistsExpression".');

  return tokens;
};

/**
 * @param {AST._ForeignKeyConstraint} node
 * @return {Token[]}
 */
export const tokenize_ForeignKeyConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('FOREIGN'));
  tokens.push(Tokens.Keyword('KEY'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.columnNames, tokenize_Identifier));
  tokens.push(Tokens.Punctuator(')'));
  tokens.push(...tokenizeForeignKeyClause(node.foreignKey));

  return tokens;
};

/**
 * @param {AST._FrameSpecBetweenClause} node
 * @return {Token[]}
 */
export const tokenize_FrameSpecBetweenClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('BETWEEN'));

  if (typeof node.between === 'string') {
    tokens.push(..._tokenizeKeywords(node.between));
  } else {
    tokens.push(...tokenize_FrameSpecExprClause(node.between));
  }

  tokens.push(Tokens.Keyword('AND'));

  if (typeof node.and === 'string') {
    tokens.push(..._tokenizeKeywords(node.and));
  } else {
    tokens.push(...tokenize_FrameSpecExprClause(node.and));
  }

  return tokens;
};

/**
 * @param {AST._FrameSpecExprClause} node
 * @return {Token[]}
 */
export const tokenize_FrameSpecExprClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeExpr(node.expr));
  tokens.push(..._tokenizeKeywords(node.position));

  return tokens;
};

/**
 * @param {AST._GroupByClause} node
 * @return {Token[]}
 */
export const tokenize_GroupByClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('GROUP'));
  tokens.push(Tokens.Keyword('BY'));
  tokens.push(..._tokenizeCommaDelimitedList(node.expressions, tokenizeExpr));

  if (node.having !== null) {
    tokens.push(Tokens.Keyword('HAVING'));
    tokens.push(...tokenizeExpr(node.having));
  }

  return tokens;
};

/**
 * @param {AST._InExpression} node
 * @return {Token[]}
 */
export const tokenize_InExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_InExpression".');

  return tokens;
};

/**
 * @param {AST._InsertSelectClause} node
 * @return {Token[]}
 */
export const tokenize_InsertSelectClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_InsertSelectClause".');

  return tokens;
};

/**
 * @param {AST._InsertValuesClause} node
 * @return {Token[]}
 */
export const tokenize_InsertValuesClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_InsertValuesClause".');

  return tokens;
};

/**
 * @param {AST._IsExpression} node
 * @return {Token[]}
 */
export const tokenize_IsExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_IsExpression".');

  return tokens;
};

/**
 * @param {AST._JoinCompound} node
 * @return {Token[]}
 */
export const tokenize_JoinCompound = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_JoinCompound".');

  return tokens;
};

/**
 * @param {AST._JoinOnClause} node
 * @return {Token[]}
 */
export const tokenize_JoinOnClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_JoinOnClause".');

  return tokens;
};

/**
 * @param {AST._JoinUsingClause} node
 * @return {Token[]}
 */
export const tokenize_JoinUsingClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_JoinUsingClause".');

  return tokens;
};

/**
 * @param {AST._Identifier} node
 * @return {Token[]}
 */
export const tokenize_Identifier = (node) => {
  return [Tokens.Identifier(node.name)];
};

/**
 * @param {AST._LimitClause} node
 * @return {Token[]}
 */
export const tokenize_LimitClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('LIMIT'));
  tokens.push(...tokenizeExpr(node.left));

  if (node.right !== null) {
    tokens.push(...tokenize_LimitTailClause(node.right));
  }

  return tokens;
};

/**
 * @param {AST._LimiterClause} node
 * @return {Token[]}
 */
export const tokenize_LimiterClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.orderBy.length > 0) {
    tokens.push(Tokens.Keyword('ORDER'));
    tokens.push(Tokens.Keyword('BY'));
    tokens.push(..._tokenizeCommaDelimitedList(node.orderBy, tokenizeOrderingTerm));
  }

  if (node.limit !== null) {
    tokens.push(...tokenize_LimitClause(node.limit));
  }

  return tokens;
};

/**
 * @param {AST._LimitTailClause} node
 * @return {Token[]}
 */
export const tokenize_LimitTailClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.offset) {
    tokens.push(Tokens.Keyword('OFFSET'));
  } else {
    tokens.push(Tokens.Punctuator(','));
  }

  tokens.push(...tokenizeExpr(node.expr));

  return tokens;
};

/**
 * @param {AST._MatchClause} node
 * @return {Token[]}
 */
export const tokenize_MatchClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('MATCH'));
  tokens.push(...tokenize_Identifier(node.name));

  return tokens;
};

/**
 * @param {AST._NotNullClause} node
 * @return {Token[]}
 */
export const tokenize_NotNullClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('NOT'));
  tokens.push(Tokens.Keyword('NULL'));

  if (node.onConflict !== null) {
    tokens.push(...tokenizeConflictClause(node.onConflict));
  }

  return tokens;
};

/**
 * @param {AST._NullComparisonExpression} node
 * @return {Token[]}
 */
export const tokenize_NullComparisonExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_NullComparisonExpression".');

  return tokens;
};

/**
 * @param {AST._NumericLiteral} node
 * @return {Token[]}
 */
export const tokenize_NumericLiteral = (node) => {
  return [Tokens.Numeric(String(node.value))];
};

/**
 * @param {AST._OnClause} node
 * @return {Token[]}
 */
export const tokenize_OnClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ON'));
  tokens.push(..._tokenizeKeywords(node.on));
  tokens.push(..._tokenizeKeywords(node.action));

  return tokens;
};

/**
 * @param {AST._Path} node
 * @return {Token[]}
 */
export const tokenize_Path = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.object !== null) {
    tokens.push(...tokenize_Identifier(node.object));
    tokens.push(Tokens.Punctuator('.'));
  }

  tokens.push(...tokenize_Identifier(node.property));

  return tokens;
};

/**
 * @param {AST._PragmaGetter} node
 * @return {Token[]}
 */
export const tokenize_PragmaGetter = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_PragmaGetter".');

  return tokens;
};

/**
 * @param {AST._PragmaSetter} node
 * @return {Token[]}
 */
export const tokenize_PragmaSetter = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_PragmaSetter".');

  return tokens;
};

/**
 * @param {AST._PrimaryKeyClause} node
 * @return {Token[]}
 */
export const tokenize_PrimaryKeyClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('PRIMARY'));
  tokens.push(Tokens.Keyword('KEY'));

  if (node.orderBy !== null) {
    tokens.push(..._tokenizeKeywords(node.orderBy));
  }

  if (node.onConflict !== null) {
    tokens.push(...tokenizeConflictClause(node.onConflict));
  }

  if (node.autoincrement) {
    tokens.push(Tokens.Keyword('AUTOINCREMENT'));
  }

  return tokens;
};

/**
 * @param {AST._PrimaryKeyConstraint} node
 * @return {Token[]}
 */
export const tokenize_PrimaryKeyConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('PRIMARY'));
  tokens.push(Tokens.Keyword('KEY'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.indexedColumns, tokenizeIndexedColumn));
  tokens.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    tokens.push(...tokenizeConflictClause(node.onConflict));
  }

  return tokens;
};

/**
 * @param {AST._RenameClause} node
 * @return {Token[]}
 */
export const tokenize_RenameClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('RENAME'));

  if (node.from !== null) {
    tokens.push(...tokenize_Identifier(node.from));
  }

  tokens.push(Tokens.Keyword('TO'));
  tokens.push(...tokenize_Identifier(node.to));

  return tokens;
};

/**
 * @param {AST._SelectClause} node
 * @return {Token[]}
 */
export const tokenize_SelectClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('SELECT'));

  if (node.modifier !== null) {
    tokens.push(..._tokenizeKeywords(node.modifier));
  }

  tokens.push(..._tokenizeCommaDelimitedList(node.resultColumns, tokenizeResultColumn));

  if (node.from !== null) {
    tokens.push(Tokens.Keyword('FROM'));
    tokens.push(...tokenizeTableOrSubquery(node.from));
  }

  if (node.where !== null) {
    tokens.push(Tokens.Keyword('WHERE'));
    tokens.push(...tokenizeExpr(node.where));
  }

  if (node.groupBy !== null) {
    tokens.push(...tokenize_GroupByClause(node.groupBy));
  }

  if (node.window.length > 0) {
    tokens.push(Tokens.Keyword('WINDOW'));
    tokens.push(..._tokenizeCommaDelimitedList(node.window, tokenize_WindowAsClause));
  }

  return tokens;
};

/**
 * @param {AST._SelectCompound} node
 * @return {Token[]}
 */
export const tokenize_SelectCompound = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(..._tokenizeKeywords(node.operator));
  tokens.push(...tokenizeSelectCore(node.selector));

  return tokens;
};

/**
 * @param {AST._SelectorClause} node
 * @return {Token[]}
 */
export const tokenize_SelectorClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_SelectorClause".');

  return tokens;
};

/**
 * @param {AST._SequenceExpression} node
 * @return {Token[]}
 */
export const tokenize_SequenceExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_SequenceExpression".');

  return tokens;
};

/**
 * @param {AST._SetClause} node
 * @return {Token[]}
 */
export const tokenize_SetClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_SetClause".');

  return tokens;
};

/**
 * @param {AST._StringLiteral} node
 * @return {Token[]}
 */
export const tokenize_StringLiteral = (node) => {
  return [Tokens.String(`'${node.value.replace(/([\\'])/g, '\\$1')}'`)];
};

/**
 * @param {AST._TableCallClause} node
 * @return {Token[]}
 */
export const tokenize_TableCallClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(..._tokenizePathLike(node.path));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.args, tokenizeExpr));
  tokens.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    tokens.push(...tokenize_Identifier(node.tableAlias));
  }

  return tokens;
};

/**
 * @param {AST._TableDef} node
 * @return {Token[]}
 */
export const tokenize_TableDef = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.columnDefs, tokenizeColumnDef));

  if (node.tableConstraints.length > 0) {
    tokens.push(Tokens.Punctuator(','));
    tokens.push(..._tokenizeCommaDelimitedList(node.tableConstraints, tokenizeTableConstraint));
  }

  tokens.push(Tokens.Punctuator(')'));

  if (node.withoutRowId) {
    tokens.push(Tokens.Keyword('WITHOUT'));
    tokens.push(Tokens.Keyword('ROWID'));
  }

  return tokens;
};

/**
 * @param {AST._TableQueryClause} node
 * @return {Token[]}
 */
export const tokenize_TableQueryClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Punctuator('('));

  if (Array.isArray(node.query)) {
    tokens.push(..._tokenizeCommaDelimitedList(node.query, tokenizeTableOrSubquery));
  } else {
    tokens.push(...tokenizeJoinClause(node.query));
  }

  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST._TableSelectClause} node
 * @return {Token[]}
 */
export const tokenize_TableSelectClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Punctuator('('));
  tokens.push(...tokenizeSelectStmt(node.select));
  tokens.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    tokens.push(...tokenize_Identifier(node.tableAlias));
  }

  return tokens;
};

/**
 * @param {AST._TableSelectorClause} node
 * @return {Token[]}
 */
export const tokenize_TableSelectorClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_TableSelectorClause".');

  return tokens;
};

/**
 * @param {AST._UniqueClause} node
 * @return {Token[]}
 */
export const tokenize_UniqueClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('UNIQUE'));

  if (node.onConflict !== null) {
    tokens.push(...tokenizeConflictClause(node.onConflict));
  }

  return tokens;
};

/**
 * @param {AST._UniqueConstraint} node
 * @return {Token[]}
 */
export const tokenize_UniqueConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('UNIQUE'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(node.indexedColumns, tokenizeIndexedColumn));
  tokens.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    tokens.push(...tokenizeConflictClause(node.onConflict));
  }

  return tokens;
};

/**
 * @param {AST._UpdateSetClause} node
 * @return {Token[]}
 */
export const tokenize_UpdateSetClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "_UpdateSetClause".');

  return tokens;
};

/**
 * @param {AST._ValueClause} node
 * @return {Token[]}
 */
export const tokenize_ValueClause = (node) => {
  return _tokenizeCommaDelimitedList(node.values, tokenizeExpr);
};

/**
 * @param {AST._ValuesClause} node
 * @return {Token[]}
 */
export const tokenize_ValuesClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('VALUES'));

  for (let i = 0; i < node.rows.length; i++) {
    if (i > 0) {
      tokens.push(Tokens.Punctuator(','));
    }

    tokens.push(Tokens.Punctuator('('));
    tokens.push(...tokenize_ValueClause(node.rows[i]));
    tokens.push(Tokens.Punctuator(')'));
  }

  return tokens;
};

/**
 * @param {AST._WindowAsClause} node
 * @return {Token[]}
 */
export const tokenize_WindowAsClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.windowName));
  tokens.push(Tokens.Keyword('AS'));
  tokens.push(...tokenize_Identifier(node.windowDefn));

  return tokens;
};

/**
 * @param {AST.AggregateFunctionInvocation} node
 * @return {Token[]}
 */
export const tokenizeAggregateFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.aggregateFunc));
  tokens.push(Tokens.Punctuator('('));

  if (node.args !== null) {
    if (node.args === '*') {
      tokens.push(Tokens.Punctuator('*'));
    } else {
      tokens.push(...tokenize_AggregateArgs(node.args));
    }
  }

  tokens.push(Tokens.Punctuator(')'));

  if (node.filter !== null) {
    tokens.push(...tokenizeFilterClause(node.filter));
  }

  return tokens;
};

/**
 * @param {AST.AlterTableStmt} node
 * @return {Token[]}
 */
export const tokenizeAlterTableStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ALTER'));
  tokens.push(Tokens.Keyword('TABLE'));
  tokens.push(..._tokenizePathLike(node.path));

  if (node.action.type === '_RenameClause') {
    tokens.push(...tokenize_RenameClause(node.action));
  } else {
    tokens.push(...tokenize_AddClause(node.action));
  }

  return tokens;
};

/**
 * @param {AST.AnalyzeStmt} node
 * @return {Token[]}
 */
export const tokenizeAnalyzeStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ANALYZE'));

  if (node.path !== null) {
    tokens.push(..._tokenizePathLike(node.path));
  }

  return tokens;
};

/**
 * @param {AST.AttachStmt} node
 * @return {Token[]}
 */
export const tokenizeAttachStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ATTACH'));
  tokens.push(...tokenizeExpr(node.expr));
  tokens.push(Tokens.Keyword('AS'));
  tokens.push(...tokenize_Identifier(node.schemaName));

  return tokens;
};

/**
 * @param {AST.BeginStmt} node
 * @return {Token[]}
 */
export const tokenizeBeginStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('BEGIN'));

  if (node.mode !== null) {
    tokens.push(..._tokenizeKeywords(node.mode));
  }

  return tokens;
};

/**
 * @param {AST.ColumnConstraint} node
 * @return {Token[]}
 */
export const tokenizeColumnConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.name !== null) {
    tokens.push(Tokens.Keyword('CONSTRAINT'));
    tokens.push(...tokenize_Identifier(node.name));
  }

  tokens.push(...tokenize_ColumnConstraintClause(node.constraint));

  return tokens;
};

/**
 * @param {AST.ColumnDef} node
 * @return {Token[]}
 */
export const tokenizeColumnDef = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.columnName));

  if (node.typeName !== null) {
    tokens.push(...tokenizeTypeName(node.typeName));
  }

  for (const columnConstraint of node.columnConstraints) {
    tokens.push(...tokenizeColumnConstraint(columnConstraint));
  }

  return tokens;
};

/**
 * @param {AST.ColumnNameList} node
 * @return {Token[]}
 */
export const tokenizeColumnNameList = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Punctuator('('));
  tokens.push(..._tokenizeCommaDelimitedList(
    node.columnNames,
    (columnName) => [Tokens.Identifier(columnName.name)]
  ));
  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST.CommitStmt} node
 * @return {Token[]}
 */
export const tokenizeCommitStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('COMMIT'));

  return tokens;
};

/**
 * @param {AST.CommonTableExpression} node
 * @return {Token[]}
 */
export const tokenizeCommonTableExpression = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeCteTableName(node.tableName));
  tokens.push(Tokens.Keyword('AS'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(...tokenizeSelectStmt(node.as));
  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST.ConflictClause} node
 * @return {Token[]}
 */
export const tokenizeConflictClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('ON'));
  tokens.push(Tokens.Keyword('CONFLICT'));
  tokens.push(..._tokenizeKeywords(node.onConflict));

  return tokens;
};

/**
 * @param {AST.CreateIndexStmt} node
 * @return {Token[]}
 */
export const tokenizeCreateIndexStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('CREATE'));

  if (node.unique) {
    tokens.push(Tokens.Keyword('UNIQUE'));
  }

  tokens.push(Tokens.Keyword('INDEX'));

  if (node.ifNotExists) {
    tokens.push(...IF_NOT_EXISTS);
  }

  tokens.push(..._tokenizePathLike(node.path));
  tokens.push(Tokens.Keyword('ON'));
  tokens.push(...tokenize_Identifier(node.tableName));
  tokens.push(...tokenize_ColumnSelectorClause(node.selector));

  return tokens;
};

/**
 * @param {AST.CreateTableStmt} node
 * @return {Token[]}
 */
export const tokenizeCreateTableStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('CREATE'));

  if (node.temporary) {
    tokens.push(Tokens.Keyword('TEMP'));
  }

  tokens.push(Tokens.Keyword('TABLE'));

  if (node.ifNotExists) {
    tokens.push(...IF_NOT_EXISTS);
  }

  tokens.push(..._tokenizePathLike(node.path));

  if (node.target.type === 'SelectStmt') {
    tokens.push(Tokens.Keyword('AS'));
    tokens.push(...tokenizeSelectStmt(node.target));
  } else {
    tokens.push(...tokenize_TableDef(node.target));
  }

  return tokens;
};

/**
 * @param {AST.CreateTriggerStmt} node
 * @return {Token[]}
 */
export const tokenizeCreateTriggerStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "CreateTriggerStmt".');
  tokens.push(Tokens.Keyword('CREATE'));

  if (node.temporary) {
    tokens.push(Tokens.Keyword('TEMP'));
  }

  tokens.push(Tokens.Keyword('TRIGGER'));

  if (node.ifNotExists) {
    tokens.push(...IF_NOT_EXISTS);
  }

  return tokens;
};

/**
 * @param {AST.CreateViewStmt} node
 * @return {Token[]}
 */
export const tokenizeCreateViewStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "CreateViewStmt".');
  tokens.push(Tokens.Keyword('CREATE'));

  if (node.temporary) {
    tokens.push(Tokens.Keyword('TEMP'));
  }

  tokens.push(Tokens.Keyword('VIEW'));

  if (node.ifNotExists) {
    tokens.push(...IF_NOT_EXISTS);
  }

  return tokens;
};

/**
 * @param {AST.CreateVirtualTableStmt} node
 * @return {Token[]}
 */
export const tokenizeCreateVirtualTableStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "CreateVirtualTableStmt".');
  tokens.push(Tokens.Keyword('CREATE'));
  tokens.push(Tokens.Keyword('VIRTUAL'));
  tokens.push(Tokens.Keyword('TABLE'));

  if (node.ifNotExists) {
    tokens.push(...IF_NOT_EXISTS);
  }

  return tokens;
};

/**
 * @param {AST.CteTableName} node
 * @return {Token[]}
 */
export const tokenizeCteTableName = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenize_Identifier(node.tableName));

  if (node.columnNames.length > 0) {
    tokens.push(Tokens.Punctuator('('));
    tokens.push(..._tokenizeCommaDelimitedList(node.columnNames, tokenize_Identifier));
    tokens.push(Tokens.Punctuator(')'));
  }

  return tokens;
};

/**
 * @param {AST.DeleteStmt} node
 * @return {Token[]}
 */
export const tokenizeDeleteStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DeleteStmt".');
  tokens.push(Tokens.Keyword('DELETE'));

  return tokens;
};

/**
 * @param {AST.DetachStmt} node
 * @return {Token[]}
 */
export const tokenizeDetachStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DetachStmt".');
  tokens.push(Tokens.Keyword('DETACH'));

  return tokens;
};

/**
 * @param {AST.DropIndexStmt} node
 * @return {Token[]}
 */
export const tokenizeDropIndexStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DropIndexStmt".');
  tokens.push(Tokens.Keyword('DROP'));

  if (node.ifExists) {
    tokens.push(...IF_EXISTS);
  }

  tokens.push(Tokens.Keyword('INDEX'));
  tokens.push(..._tokenizePathLike(node.path));

  return tokens;
};

/**
 * @param {AST.DropTableStmt} node
 * @return {Token[]}
 */
export const tokenizeDropTableStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DropTableStmt".');
  tokens.push(Tokens.Keyword('DROP'));

  if (node.ifExists) {
    tokens.push(...IF_EXISTS);
  }

  tokens.push(Tokens.Keyword('TABLE'));
  tokens.push(..._tokenizePathLike(node.path));

  return tokens;
};

/**
 * @param {AST.DropTriggerStmt} node
 * @return {Token[]}
 */
export const tokenizeDropTriggerStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DropTriggerStmt".');
  tokens.push(Tokens.Keyword('DROP'));

  if (node.ifExists) {
    tokens.push(...IF_EXISTS);
  }

  tokens.push(Tokens.Keyword('TRIGGER'));
  tokens.push(..._tokenizePathLike(node.path));

  return tokens;
};

/**
 * @param {AST.DropViewStmt} node
 * @return {Token[]}
 */
export const tokenizeDropViewStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "DropViewStmt".');
  tokens.push(Tokens.Keyword('DROP'));

  if (node.ifExists) {
    tokens.push(...IF_EXISTS);
  }

  tokens.push(Tokens.Keyword('VIEW'));
  tokens.push(..._tokenizePathLike(node.path));

  return tokens;
};

/**
 * @param {AST.Expr} node
 * @return {Token[]}
 */
export const tokenizeExpr = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
      return tokenizeLiteralValue(node);
    case '_BindParameter':
      return tokenize_BindParameter(node);
    case '_ColumnPath':
      return tokenize_ColumnPath(node);
    case '_Path':
      return tokenize_Path(node);
    case '_Identifier':
      return tokenize_Identifier(node);
    case '_BinaryExpression':
      return tokenize_BinaryExpression(node);
    case '_CallExpression':
      return tokenize_CallExpression(node);
    case '_SequenceExpression':
      return tokenize_SequenceExpression(node);
    case '_CastExpression':
      return tokenize_CastExpression(node);
    case '_CollateExpression':
      return tokenize_CollateExpression(node);
    case '_BinaryKeywordExpression':
      return tokenize_BinaryKeywordExpression(node);
    case '_NullComparisonExpression':
      return tokenize_NullComparisonExpression(node);
    case '_IsExpression':
      return tokenize_IsExpression(node);
    case '_BetweenExpression':
      return tokenize_BetweenExpression(node);
    case '_InExpression':
      return tokenize_InExpression(node);
    case '_ExistsExpression':
      return tokenize_ExistsExpression(node);
    case '_CaseExpression':
      return tokenize_CaseExpression(node);
    case 'RaiseFunction':
      return tokenizeRaiseFunction(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.FactoredSelectStmt} node
 * @return {Token[]}
 */
export const tokenizeFactoredSelectStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "FactoredSelectStmt".');

  return tokens;
};

/**
 * @param {AST.FilterClause} node
 * @return {Token[]}
 */
export const tokenizeFilterClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('FILTER'));
  tokens.push(Tokens.Punctuator('('));
  tokens.push(Tokens.Keyword('WHERE'));
  tokens.push(...tokenizeExpr(node.where));
  tokens.push(Tokens.Punctuator(')'));

  return tokens;
};

/**
 * @param {AST.ForeignKeyClause} node
 * @return {Token[]}
 */
export const tokenizeForeignKeyClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('REFERENCES'));
  tokens.push(...tokenize_Identifier(node.foreignTable));

  if (node.columnNames.length > 0) {
    tokens.push(Tokens.Punctuator('('));
    tokens.push(..._tokenizeCommaDelimitedList(node.columnNames, tokenize_Identifier));
    tokens.push(Tokens.Punctuator(')'));
  }

  for (const event of node.events) {
    if (event.type === '_OnClause') {
      tokens.push(...tokenize_OnClause(event));
    } else {
      tokens.push(...tokenize_MatchClause(event));
    }
  }

  if (node.deferrable) {
    tokens.push(...tokenize_DeferrableClause(node.deferrable));
  }

  return tokens;
};

/**
 * @param {AST.FrameSpec} node
 * @return {Token[]}
 */
export const tokenizeFrameSpec = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(..._tokenizeKeywords(node.frame));

  if (typeof node.target === 'string') {
    tokens.push(..._tokenizeKeywords(node.target));
  } else if (node.target.type === '_FrameSpecBetweenClause') {
    tokens.push(...tokenize_FrameSpecBetweenClause(node.target));
  } else {
    tokens.push(...tokenizeExpr(node.target));
    tokens.push(Tokens.Keyword('PRECEDING'));
  }

  if (node.exclude !== null) {
    tokens.push(..._tokenizeKeywords(node.exclude));
  }

  return tokens;
};

/**
 * @param {AST.IndexedColumn} node
 * @return {Token[]}
 */
export const tokenizeIndexedColumn = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeExpr(node.target));

  if (node.collationName !== null) {
    tokens.push(Tokens.Keyword('COLLATE'));
    tokens.push(...tokenize_Identifier(node.collationName));
  }

  if (node.orderBy !== null) {
    tokens.push(..._tokenizeKeywords(node.orderBy));
  }

  return tokens;
};

/**
 * @param {AST.InsertStmt} node
 * @return {Token[]}
 */
export const tokenizeInsertStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "InsertStmt".');
  tokens.push(Tokens.Keyword('INSERT'));
  tokens.push(Tokens.Keyword('INTO'));

  return tokens;
};

/**
 * @param {AST.JoinClause} node
 * @return {Token[]}
 */
export const tokenizeJoinClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "JoinClause".');

  return tokens;
};

/**
 * @param {AST.JoinConstraint} node
 * @return {Token[]}
 */
export const tokenizeJoinConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "JoinConstraint".');

  return tokens;
};

/**
 * @param {AST.LiteralValue} node
 * @return {Token[]}
 */
export const tokenizeLiteralValue = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
      return tokenize_NumericLiteral(node);
    case '_StringLiteral':
      return tokenize_StringLiteral(node);
    case '_BlobLiteral':
      return tokenize_BlobLiteral(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.OrderingTerm} node
 * @return {Token[]}
 */
export const tokenizeOrderingTerm = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(...tokenizeIndexedColumn(node.indexedColumn));

  if (node.nulls !== null) {
    tokens.push(Tokens.Keyword('NULLS'));
    tokens.push(..._tokenizeKeywords(node.nulls));
  }

  return tokens;
};

/**
 * @param {AST.OverClause} node
 * @return {Token[]}
 */
export const tokenizeOverClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "OverClause".');

  return tokens;
};

/**
 * @param {AST.PragmaStmt} node
 * @return {Token[]}
 */
export const tokenizePragmaStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "PragmaStmt".');
  tokens.push(Tokens.Keyword('PRAGMA'));

  return tokens;
};

/**
 * @param {AST.PragmaValue} node
 * @return {Token[]}
 */
export const tokenizePragmaValue = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "PragmaValue".');

  return tokens;
};

/**
 * @param {AST.QualifiedTableName} node
 * @return {Token[]}
 */
export const tokenizeQualifiedTableName = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(..._tokenizePathLike(node.path));

  if (node.alias !== null) {
    tokens.push(Tokens.Keyword('AS'));
    tokens.push(...tokenize_Identifier(node.alias));
  }

  if (node.indexedBy === false) {
    tokens.push(Tokens.Keyword('NOT'));
    tokens.push(Tokens.Keyword('INDEXED'));
  } else if (node.indexedBy !== null) {
    tokens.push(Tokens.Keyword('INDEXED'));
    tokens.push(Tokens.Keyword('BY'));
    tokens.push(...tokenize_Identifier(node.indexedBy));
  }

  return tokens;
};

/**
 * @param {AST.RaiseFunction} node
 * @return {Token[]}
 */
export const tokenizeRaiseFunction = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "RaiseFunction".');

  return tokens;
};

/**
 * @param {AST.RecursiveCte} node
 * @return {Token[]}
 */
export const tokenizeRecursiveCte = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "RecursiveCte".');

  return tokens;
};

/**
 * @param {AST.ReindexStmt} node
 * @return {Token[]}
 */
export const tokenizeReindexStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "ReindexStmt".');
  tokens.push(Tokens.Keyword('REINDEX'));

  return tokens;
};

/**
 * @param {AST.ReleaseStmt} node
 * @return {Token[]}
 */
export const tokenizeReleaseStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "ReleaseStmt".');
  tokens.push(Tokens.Keyword('RELEASE'));

  return tokens;
};

/**
 * @param {AST.ResultColumn} node
 * @return {Token[]}
 */
export const tokenizeResultColumn = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.source === '*') {
    tokens.push(Tokens.Punctuator('*'));
  } else if (node.source.type === '_ColumnAliasClause') {
    tokens.push(...tokenize_ColumnAliasClause(node.source));
  } else if (node.source.type === '_AllColumnsClause') {
    tokens.push(...tokenize_AllColumnsClause(node.source));
  } else {
    tokens.push(...tokenizeExpr(node.source));
  }

  return tokens;
};

/**
 * @param {AST.RollbackStmt} node
 * @return {Token[]}
 */
export const tokenizeRollbackStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "RollbackStmt".');
  tokens.push(Tokens.Keyword('ROLLBACK'));

  return tokens;
};

/**
 * @param {AST.SavepointStmt} node
 * @return {Token[]}
 */
export const tokenizeSavepointStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "SavepointStmt".');
  tokens.push(Tokens.Keyword('SAVEPOINT'));

  return tokens;
};

/**
 * @param {AST.SelectCore} node
 * @return {Token[]}
 */
export const tokenizeSelectCore = (node) => {
  return node.type === '_SelectClause'
    ? tokenize_SelectClause(node)
    : tokenize_ValuesClause(node);
};

/**
 * @param {AST.SelectStmt} node
 * @return {Token[]}
 */
export const tokenizeSelectStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.withClause !== null) {
    tokens.push(...tokenizeWithClause(node.withClause));
  }

  tokens.push(...tokenizeSelectCore(node.select[0]));

  for (let i = 1; i < node.select.length; i++) {
    tokens.push(...tokenize_SelectCompound(/** @type {AST._SelectCompound} */ (node.select[i])));
  }

  if (node.limiter !== null) {
    tokens.push(...tokenize_LimiterClause(node.limiter));
  }

  return tokens;
};

/**
 * @param {AST.SimpleFunctionInvocation} node
 * @return {Token[]}
 */
export const tokenizeSimpleFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "SimpleFunctionInvocation".');

  return tokens;
};

/**
 * @param {AST.SimpleSelectStmt} node
 * @return {Token[]}
 */
export const tokenizeSimpleSelectStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "SimpleSelectStmt".');
  tokens.push(Tokens.Keyword('SELECT'));

  return tokens;
};

/**
 * @param {AST.SqlStmt} node
 * @return {Token[]}
 */
export const tokenizeSqlStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "SqlStmt".');

  return tokens;
};

/**
 * @param {AST.SqlStmtList} node
 * @return {Token[]}
 */
export const tokenizeSqlStmtList = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "SqlStmtList".');

  return tokens;
};

/**
 * @param {AST.TableConstraint} node
 * @return {Token[]}
 */
export const tokenizeTableConstraint = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  if (node.name !== null) {
    tokens.push(Tokens.Keyword('CONSTRAINT'));
    tokens.push(...tokenize_Identifier(node.name));
  }

  switch (node.constraint.type) {
    case '_PrimaryKeyConstraint':
      tokens.push(...tokenize_PrimaryKeyConstraint(node.constraint));
      break;
    case '_UniqueConstraint':
      tokens.push(...tokenize_UniqueConstraint(node.constraint));
      break;
    case '_CheckConstraint':
      tokens.push(...tokenize_CheckConstraint(node.constraint));
      break;
    case '_ForeignKeyConstraint':
      tokens.push(...tokenize_ForeignKeyConstraint(node.constraint));
      break;
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }

  return tokens;
};

/**
 * @param {AST.TableOrSubquery} node
 * @return {Token[]}
 */
export const tokenizeTableOrSubquery = (node) => {
  switch (node.type) {
    case 'QualifiedTableName':
      return tokenizeQualifiedTableName(node);
    case '_TableCallClause':
      return tokenize_TableCallClause(node);
    case '_TableSelectClause':
      return tokenize_TableSelectClause(node);
    case '_TableQueryClause':
      return tokenize_TableQueryClause(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.TypeName} node
 * @return {Token[]}
 */
export const tokenizeTypeName = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  for (const name of node.names) {
    tokens.push(..._tokenizeKeywords(name));
  }

  if (node.args[0] !== undefined) {
    tokens.push(Tokens.Punctuator('('));
    tokens.push(...tokenize_NumericLiteral(node.args[0]));

    if (node.args[1] !== undefined) {
      tokens.push(Tokens.Punctuator(','));
      tokens.push(...tokenize_NumericLiteral(node.args[1]));
    }

    tokens.push(Tokens.Punctuator(')'));
  }

  return tokens;
};

/**
 * @param {AST.UpdateStmt} node
 * @return {Token[]}
 */
export const tokenizeUpdateStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "UpdateStmt".');
  tokens.push(Tokens.Keyword('UPDATE'));

  return tokens;
};

/**
 * @param {AST.UpsertClause} node
 * @return {Token[]}
 */
export const tokenizeUpsertClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "UpsertClause".');

  return tokens;
};

/**
 * @param {AST.VacuumStmt} node
 * @return {Token[]}
 */
export const tokenizeVacuumStmt = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "VacuumStmt".');
  tokens.push(Tokens.Keyword('VACUUM'));

  return tokens;
};

/**
 * @param {AST.WindowDefn} node
 * @return {Token[]}
 */
export const tokenizeWindowDefn = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "WindowDefn".');

  return tokens;
};

/**
 * @param {AST.WindowFunctionInvocation} node
 * @return {Token[]}
 */
export const tokenizeWindowFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  throw new Error('Compiler not implemented for node type "WindowFunctionInvocation".');

  return tokens;
};

/**
 * @param {AST.WithClause} node
 * @return {Token[]}
 */
export const tokenizeWithClause = (node) => {
  /** @type {Token[]} */
  const tokens = [];

  tokens.push(Tokens.Keyword('WITH'));

  if (node.recursive) {
    tokens.push(Tokens.Keyword('RECURSIVE'));
  }

  tokens.push(..._tokenizeCommaDelimitedList(node.expressions, tokenizeCommonTableExpression));

  return tokens;
};

/**
 * @param {AST._Node} node
 * @return {Token[]}
 */
export const tokenize = (node) => {
  switch (node.type) {
    case '_AddClause':
      return tokenize_AddClause(node);
    case '_AggregateArgs':
      return tokenize_AggregateArgs(node);
    case '_AsClause':
      return tokenize_AsClause(node);
    case '_BetweenExpression':
      return tokenize_BetweenExpression(node);
    case '_BinaryExpression':
      return tokenize_BinaryExpression(node);
    case '_BinaryKeywordExpression':
      return tokenize_BinaryKeywordExpression(node);
    case '_BindParameter':
      return tokenize_BindParameter(node);
    case '_BlobLiteral':
      return tokenize_BlobLiteral(node);
    case '_CallExpression':
      return tokenize_CallExpression(node);
    case '_CaseExpression':
      return tokenize_CaseExpression(node);
    case '_CaseClause':
      return tokenize_CaseClause(node);
    case '_CastExpression':
      return tokenize_CastExpression(node);
    case '_CheckClause':
      return tokenize_CheckClause(node);
    case '_CheckConstraint':
      return tokenize_CheckConstraint(node);
    case '_CollateClause':
      return tokenize_CollateClause(node);
    case '_CollateExpression':
      return tokenize_CollateExpression(node);
    case '_ColumnAliasClause':
      return tokenize_ColumnAliasClause(node);
    case '_ColumnPath':
      return tokenize_ColumnPath(node);
    case '_ColumnSelectorClause':
      return tokenize_ColumnSelectorClause(node);
    case '_DefaultClause':
      return tokenize_DefaultClause(node);
    case '_DeferrableClause':
      return tokenize_DeferrableClause(node);
    case '_ExistsExpression':
      return tokenize_ExistsExpression(node);
    case '_ForeignKeyConstraint':
      return tokenize_ForeignKeyConstraint(node);
    case '_FrameSpecBetweenClause':
      return tokenize_FrameSpecBetweenClause(node);
    case '_FrameSpecExprClause':
      return tokenize_FrameSpecExprClause(node);
    case '_GroupByClause':
      return tokenize_GroupByClause(node);
    case '_Identifier':
      return tokenize_Identifier(node);
    case '_InExpression':
      return tokenize_InExpression(node);
    case '_InsertSelectClause':
      return tokenize_InsertSelectClause(node);
    case '_InsertValuesClause':
      return tokenize_InsertValuesClause(node);
    case '_IsExpression':
      return tokenize_IsExpression(node);
    case '_JoinCompound':
      return tokenize_JoinCompound(node);
    case '_JoinOnClause':
      return tokenize_JoinOnClause(node);
    case '_JoinUsingClause':
      return tokenize_JoinUsingClause(node);
    case '_LimitClause':
      return tokenize_LimitClause(node);
    case '_LimiterClause':
      return tokenize_LimiterClause(node);
    case '_LimitTailClause':
      return tokenize_LimitTailClause(node);
    case '_MatchClause':
      return tokenize_MatchClause(node);
    case '_NotNullClause':
      return tokenize_NotNullClause(node);
    case '_NullComparisonExpression':
      return tokenize_NullComparisonExpression(node);
    case '_NumericLiteral':
      return tokenize_NumericLiteral(node);
    case '_OnClause':
      return tokenize_OnClause(node);
    case '_Path':
      return tokenize_Path(node);
    case '_PragmaGetter':
      return tokenize_PragmaGetter(node);
    case '_PragmaSetter':
      return tokenize_PragmaSetter(node);
    case '_PrimaryKeyClause':
      return tokenize_PrimaryKeyClause(node);
    case '_PrimaryKeyConstraint':
      return tokenize_PrimaryKeyConstraint(node);
    case '_RenameClause':
      return tokenize_RenameClause(node);
    case '_SelectClause':
      return tokenize_SelectClause(node);
    case '_SelectCompound':
      return tokenize_SelectCompound(node);
    case '_SelectorClause':
      return tokenize_SelectorClause(node);
    case '_SequenceExpression':
      return tokenize_SequenceExpression(node);
    case '_SetClause':
      return tokenize_SetClause(node);
    case '_StringLiteral':
      return tokenize_StringLiteral(node);
    case '_TableCallClause':
      return tokenize_TableCallClause(node);
    case '_TableDef':
      return tokenize_TableDef(node);
    case '_TableQueryClause':
      return tokenize_TableQueryClause(node);
    case '_TableSelectClause':
      return tokenize_TableSelectClause(node);
    case '_TableSelectorClause':
      return tokenize_TableSelectorClause(node);
    case '_UniqueClause':
      return tokenize_UniqueClause(node);
    case '_UniqueConstraint':
      return tokenize_UniqueConstraint(node);
    case '_UpdateSetClause':
      return tokenize_UpdateSetClause(node);
    case '_ValueClause':
      return tokenize_ValueClause(node);
    case '_ValuesClause':
      return tokenize_ValuesClause(node);
    case '_WindowAsClause':
      return tokenize_WindowAsClause(node);
    case 'AggregateFunctionInvocation':
      return tokenizeAggregateFunctionInvocation(node);
    case 'AlterTableStmt':
      return tokenizeAlterTableStmt(node);
    case 'AnalyzeStmt':
      return tokenizeAnalyzeStmt(node);
    case 'AttachStmt':
      return tokenizeAttachStmt(node);
    case 'BeginStmt':
      return tokenizeBeginStmt(node);
    case 'ColumnConstraint':
      return tokenizeColumnConstraint(node);
    case 'ColumnDef':
      return tokenizeColumnDef(node);
    case 'ColumnNameList':
      return tokenizeColumnNameList(node);
    case 'CommitStmt':
      return tokenizeCommitStmt(node);
    case 'CommonTableExpression':
      return tokenizeCommonTableExpression(node);
    case 'ConflictClause':
      return tokenizeConflictClause(node);
    case 'CreateIndexStmt':
      return tokenizeCreateIndexStmt(node);
    case 'CreateTableStmt':
      return tokenizeCreateTableStmt(node);
    case 'CreateTriggerStmt':
      return tokenizeCreateTriggerStmt(node);
    case 'CreateViewStmt':
      return tokenizeCreateViewStmt(node);
    case 'CreateVirtualTableStmt':
      return tokenizeCreateVirtualTableStmt(node);
    case 'CteTableName':
      return tokenizeCteTableName(node);
    case 'DeleteStmt':
      return tokenizeDeleteStmt(node);
    case 'DetachStmt':
      return tokenizeDetachStmt(node);
    case 'DropIndexStmt':
      return tokenizeDropIndexStmt(node);
    case 'DropTableStmt':
      return tokenizeDropTableStmt(node);
    case 'DropTriggerStmt':
      return tokenizeDropTriggerStmt(node);
    case 'DropViewStmt':
      return tokenizeDropViewStmt(node);
    case 'FactoredSelectStmt':
      return tokenizeFactoredSelectStmt(node);
    case 'FilterClause':
      return tokenizeFilterClause(node);
    case 'ForeignKeyClause':
      return tokenizeForeignKeyClause(node);
    case 'FrameSpec':
      return tokenizeFrameSpec(node);
    case 'IndexedColumn':
      return tokenizeIndexedColumn(node);
    case 'InsertStmt':
      return tokenizeInsertStmt(node);
    case 'JoinClause':
      return tokenizeJoinClause(node);
    case 'JoinConstraint':
      return tokenizeJoinConstraint(node);
    case 'OrderingTerm':
      return tokenizeOrderingTerm(node);
    case 'OverClause':
      return tokenizeOverClause(node);
    case 'PragmaStmt':
      return tokenizePragmaStmt(node);
    case 'PragmaValue':
      return tokenizePragmaValue(node);
    case 'QualifiedTableName':
      return tokenizeQualifiedTableName(node);
    case 'RaiseFunction':
      return tokenizeRaiseFunction(node);
    case 'RecursiveCte':
      return tokenizeRecursiveCte(node);
    case 'ReindexStmt':
      return tokenizeReindexStmt(node);
    case 'ReleaseStmt':
      return tokenizeReleaseStmt(node);
    case 'ResultColumn':
      return tokenizeResultColumn(node);
    case 'RollbackStmt':
      return tokenizeRollbackStmt(node);
    case 'SavepointStmt':
      return tokenizeSavepointStmt(node);
    case 'SelectStmt':
      return tokenizeSelectStmt(node);
    case 'SimpleFunctionInvocation':
      return tokenizeSimpleFunctionInvocation(node);
    case 'SimpleSelectStmt':
      return tokenizeSimpleSelectStmt(node);
    case 'SqlStmt':
      return tokenizeSqlStmt(node);
    case 'SqlStmtList':
      return tokenizeSqlStmtList(node);
    case 'TableConstraint':
      return tokenizeTableConstraint(node);
    case 'TypeName':
      return tokenizeTypeName(node);
    case 'UpdateStmt':
      return tokenizeUpdateStmt(node);
    case 'UpsertClause':
      return tokenizeUpsertClause(node);
    case 'VacuumStmt':
      return tokenizeVacuumStmt(node);
    case 'WindowDefn':
      return tokenizeWindowDefn(node);
    case 'WindowFunctionInvocation':
      return tokenizeWindowFunctionInvocation(node);
    case 'WithClause':
      return tokenizeWithClause(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};
