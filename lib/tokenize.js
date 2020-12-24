/**
 * @typedef {import('./types').Token} Token
 */

import { AST } from '@robinblomberg/sqlite-ast';
import * as Tokens from './tokens.js';

/*
 * Helpers
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {string} keywords
 * @return {Token[]}
 */
const _ = (keywords) => {
  return keywords.split(/\s+/).map(Tokens.Keyword);
};

/**
 * @template T
 * @param {T[]} nodes
 * @param {(node: T) => Token[]} Node
 * @return {Token[]}
 */
const __CommaDelimitedList = (nodes, Node) => {
  /** @type {Token[]} */
  const t = [];

  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) {
      t.push(Tokens.Punctuator(','));
    }

    t.push(...Node(nodes[i]));
  }

  return t;
};

/**
 * @param {AST._Path | AST._Identifier} node
 * @return {Token[]}
 */
const __PathLike = (node) => {
  return node.type === '_Path'
    ? _Path(node)
    : _Identifier(node);
};

/*
 * Internal nodes
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {AST._AddClause} node
 * @return {Token[]}
 */
export const _AddClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ADD'));
  t.push(...ColumnDef(node.columnDef));

  return t;
};

/**
 * @param {AST._AggregateArgs} node
 * @return {Token[]}
 */
export const _AggregateArgs = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.distinct) {
    t.push(..._('DISTINCT'));
  }

  t.push(...__CommaDelimitedList(node.expressions, Expr));

  return t;
};

/**
 * @param {AST._AllColumnsClause} node
 * @return {Token[]}
 */
export const _AllColumnsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.tableName));
  t.push(..._('AS'));
  t.push(Tokens.Punctuator('*'));

  return t;
};

/**
 * @param {AST._AsClause} node
 * @return {Token[]}
 */
export const _AsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.generatedAlways) {
    t.push(..._('GENERATED ALWAYS'));
  }

  t.push(..._('AS'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.as));
  t.push(Tokens.Punctuator(')'));

  if (node.mode !== null) {
    t.push(..._(node.mode));
  }

  return t;
};

/**
 * @param {AST._BetweenExpression} node
 * @return {Token[]}
 */
export const _BetweenExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_BetweenExpression".');

  return t;
};

/**
 * @param {AST._BinaryExpression} node
 * @return {Token[]}
 */
export const _BinaryExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.left));

  if (/^[A-Z]+$/.test(node.operator)) {
    t.push(..._(node.operator));
  } else {
    t.push(Tokens.Punctuator(node.operator));
  }

  t.push(...Expr(node.right));

  return t;
};

/**
 * @param {AST._BindParameter} node
 * @return {Token[]}
 */
export const _BindParameter = (node) => {
  return _Identifier(node.bindParameter);
};

/**
 * @param {AST._BinaryKeywordExpression} node
 * @return {Token[]}
 */
export const _BinaryKeywordExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_BinaryKeywordExpression".');

  return t;
};

/**
 * @param {AST._BlobLiteral} node
 * @return {Token[]}
 */
export const _BlobLiteral = (node) => {
  return node.value.map((chunk) => {
    return Tokens.Hex(chunk);
  });
};

/**
 * @param {AST._CallExpression} node
 * @return {Token[]}
 */
export const _CallExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.functionName));
  t.push(Tokens.Punctuator('('));

  if (node.args === '*') {
    t.push(Tokens.Punctuator('*'));
  } else {
    t.push(...__CommaDelimitedList(node.args, Expr));
  }

  t.push(Tokens.Punctuator(')'));

  if (node.filter !== null) {
    t.push(...FilterClause(node.filter));
  }

  if (node.over !== null) {
    t.push(...OverClause(node.over));
  }

  return t;
};

/**
 * @param {AST._CaseExpression} node
 * @return {Token[]}
 */
export const _CaseExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_CaseExpression".');

  return t;
};

/**
 * @param {AST._CaseClause} node
 * @return {Token[]}
 */
export const _CaseClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_CaseClause".');

  return t;
};

/**
 * @param {AST._CastExpression} node
 * @return {Token[]}
 */
export const _CastExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_CastExpression".');

  return t;
};

/**
 * @param {AST._CheckClause} node
 * @return {Token[]}
 */
export const _CheckClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CHECK'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.expr));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._CheckConstraint} node
 * @return {Token[]}
 */
export const _CheckConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CHECK'));
  t.push(Tokens.Punctuator('('));
  t.push(...Expr(node.check));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._CollateClause} node
 * @return {Token[]}
 */
export const _CollateClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('COLLATE'));
  t.push(..._Identifier(node.collationName));

  return t;
};

/**
 * @param {AST._CollateExpression} node
 * @return {Token[]}
 */
export const _CollateExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_CollateExpression".');

  return t;
};

/**
 * @param {AST._ColumnAliasClause} node
 * @return {Token[]}
 */
export const _ColumnAliasClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));
  t.push(..._('AS'));
  t.push(..._Identifier(node.as));

  return t;
};

/**
 * @param {AST._ColumnConstraintClause} node
 * @return {Token[]}
 */
export const _ColumnConstraintClause = (node) => {
  switch (node.type) {
    case '_PrimaryKeyClause':
      return _PrimaryKeyClause(node);
    case '_NotNullClause':
      return _NotNullClause(node);
    case '_UniqueClause':
      return _UniqueClause(node);
    case '_CheckClause':
      return _CheckClause(node);
    case '_DefaultClause':
      return _DefaultClause(node);
    case '_CollateClause':
      return _CollateClause(node);
    case 'ForeignKeyClause':
      return ForeignKeyClause(node);
    case '_AsClause':
      return _AsClause(node);
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
export const _ColumnPath = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.tablePath));
  t.push(Tokens.Punctuator('.'));
  t.push(..._Identifier(node.columnName));

  return t;
};

/**
 * @param {AST._ColumnSelectorClause} node
 * @return {Token[]}
 */
export const _ColumnSelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.indexedColumns, _Identifier));
  t.push(Tokens.Punctuator(')'));

  if (node.where !== null) {
    t.push(..._('WHERE'));
    t.push(...Expr(node.where));
  }

  return t;
};

/**
 * @param {AST._DefaultClause} node
 * @return {Token[]}
 */
export const _DefaultClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('DEFAULT'));

  switch (node.expr.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
      t.push(...Expr(node.expr));
      break;
    default:
      t.push(Tokens.Punctuator('('));
      t.push(...Expr(node.expr));
      t.push(Tokens.Punctuator(')'));
      break;
  }

  return t;
};

/**
 * @param {AST._DeferrableClause} node
 * @return {Token[]}
 */
export const _DeferrableClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.negated) {
    t.push(..._('NOT'));
  }

  t.push(..._('DEFERRABLE'));

  if (node.initially) {
    t.push(..._('INITIALLY'));
    t.push(..._(node.initially));
  }

  return t;
};

/**
 * @param {AST._ExistsExpression} node
 * @return {Token[]}
 */
export const _ExistsExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_ExistsExpression".');

  return t;
};

/**
 * @param {AST._ForeignKeyConstraint} node
 * @return {Token[]}
 */
export const _ForeignKeyConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('FOREIGN KEY'));
  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.columnNames, _Identifier));
  t.push(Tokens.Punctuator(')'));
  t.push(...ForeignKeyClause(node.foreignKey));

  return t;
};

/**
 * @param {AST._FrameSpecBetweenClause} node
 * @return {Token[]}
 */
export const _FrameSpecBetweenClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('BETWEEN'));

  if (typeof node.between === 'string') {
    t.push(..._(node.between));
  } else {
    t.push(..._FrameSpecExprClause(node.between));
  }

  t.push(..._('AND'));

  if (typeof node.and === 'string') {
    t.push(..._(node.and));
  } else {
    t.push(..._FrameSpecExprClause(node.and));
  }

  return t;
};

/**
 * @param {AST._FrameSpecExprClause} node
 * @return {Token[]}
 */
export const _FrameSpecExprClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.expr));
  t.push(..._(node.position));

  return t;
};

/**
 * @param {AST._GroupByClause} node
 * @return {Token[]}
 */
export const _GroupByClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('GROUP BY'));
  t.push(...__CommaDelimitedList(node.expressions, Expr));

  if (node.having !== null) {
    t.push(..._('HAVING'));
    t.push(...Expr(node.having));
  }

  return t;
};

/**
 * @param {AST._InExpression} node
 * @return {Token[]}
 */
export const _InExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_InExpression".');

  return t;
};

/**
 * @param {AST._InsertSelectClause} node
 * @return {Token[]}
 */
export const _InsertSelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_InsertSelectClause".');

  return t;
};

/**
 * @param {AST._InsertValuesClause} node
 * @return {Token[]}
 */
export const _InsertValuesClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_InsertValuesClause".');

  return t;
};

/**
 * @param {AST._IsExpression} node
 * @return {Token[]}
 */
export const _IsExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_IsExpression".');

  return t;
};

/**
 * @param {AST._JoinCompound} node
 * @return {Token[]}
 */
export const _JoinCompound = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_JoinCompound".');

  return t;
};

/**
 * @param {AST._JoinOnClause} node
 * @return {Token[]}
 */
export const _JoinOnClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_JoinOnClause".');

  return t;
};

/**
 * @param {AST._JoinUsingClause} node
 * @return {Token[]}
 */
export const _JoinUsingClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_JoinUsingClause".');

  return t;
};

/**
 * @param {AST._Identifier} node
 * @return {Token[]}
 */
export const _Identifier = (node) => {
  return [Tokens.Identifier(node.name)];
};

/**
 * @param {AST._LimitClause} node
 * @return {Token[]}
 */
export const _LimitClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('LIMIT'));
  t.push(...Expr(node.left));

  if (node.right !== null) {
    t.push(..._LimitTailClause(node.right));
  }

  return t;
};

/**
 * @param {AST._LimiterClause} node
 * @return {Token[]}
 */
export const _LimiterClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.orderBy.length > 0) {
    t.push(..._('ORDER BY'));
    t.push(...__CommaDelimitedList(node.orderBy, OrderingTerm));
  }

  if (node.limit !== null) {
    t.push(..._LimitClause(node.limit));
  }

  return t;
};

/**
 * @param {AST._LimitTailClause} node
 * @return {Token[]}
 */
export const _LimitTailClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.offset) {
    t.push(..._('OFFSET'));
  } else {
    t.push(Tokens.Punctuator(','));
  }

  t.push(...Expr(node.expr));

  return t;
};

/**
 * @param {AST._MatchClause} node
 * @return {Token[]}
 */
export const _MatchClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('MATCH'));
  t.push(..._Identifier(node.name));

  return t;
};

/**
 * @param {AST._NotNullClause} node
 * @return {Token[]}
 */
export const _NotNullClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('NOT NULL'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._NullComparisonExpression} node
 * @return {Token[]}
 */
export const _NullComparisonExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_NullComparisonExpression".');

  return t;
};

/**
 * @param {AST._NumericLiteral} node
 * @return {Token[]}
 */
export const _NumericLiteral = (node) => {
  return [Tokens.Numeric(String(node.value))];
};

/**
 * @param {AST._OnClause} node
 * @return {Token[]}
 */
export const _OnClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON'));
  t.push(..._(node.on));
  t.push(..._(node.action));

  return t;
};

/**
 * @param {AST._Path} node
 * @return {Token[]}
 */
export const _Path = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.object !== null) {
    t.push(..._Identifier(node.object));
    t.push(Tokens.Punctuator('.'));
  }

  t.push(..._Identifier(node.property));

  return t;
};

/**
 * @param {AST._PragmaGetter} node
 * @return {Token[]}
 */
export const _PragmaGetter = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_PragmaGetter".');

  return t;
};

/**
 * @param {AST._PragmaSetter} node
 * @return {Token[]}
 */
export const _PragmaSetter = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_PragmaSetter".');

  return t;
};

/**
 * @param {AST._PrimaryKeyClause} node
 * @return {Token[]}
 */
export const _PrimaryKeyClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('PRIMARY KEY'));

  if (node.orderBy !== null) {
    t.push(..._(node.orderBy));
  }

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  if (node.autoincrement) {
    t.push(..._('AUTOINCREMENT'));
  }

  return t;
};

/**
 * @param {AST._PrimaryKeyConstraint} node
 * @return {Token[]}
 */
export const _PrimaryKeyConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('PRIMARY KEY'));
  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.indexedColumns, IndexedColumn));
  t.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._RenameClause} node
 * @return {Token[]}
 */
export const _RenameClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('RENAME'));

  if (node.from !== null) {
    t.push(..._Identifier(node.from));
  }

  t.push(..._('TO'));
  t.push(..._Identifier(node.to));

  return t;
};

/**
 * @param {AST._SelectClause} node
 * @return {Token[]}
 */
export const _SelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('SELECT'));

  if (node.modifier !== null) {
    t.push(..._(node.modifier));
  }

  t.push(...__CommaDelimitedList(node.resultColumns, ResultColumn));

  if (node.from !== null) {
    t.push(..._('FROM'));
    t.push(...TableOrSubquery(node.from));
  }

  if (node.where !== null) {
    t.push(..._('WHERE'));
    t.push(...Expr(node.where));
  }

  if (node.groupBy !== null) {
    t.push(..._GroupByClause(node.groupBy));
  }

  if (node.window.length > 0) {
    t.push(..._('WINDOW'));
    t.push(...__CommaDelimitedList(node.window, _WindowAsClause));
  }

  return t;
};

/**
 * @param {AST._SelectCompound} node
 * @return {Token[]}
 */
export const _SelectCompound = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._(node.operator));
  t.push(...SelectCore(node.selector));

  return t;
};

/**
 * @param {AST._SelectorClause} node
 * @return {Token[]}
 */
export const _SelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_SelectorClause".');

  return t;
};

/**
 * @param {AST._SequenceExpression} node
 * @return {Token[]}
 */
export const _SequenceExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_SequenceExpression".');

  return t;
};

/**
 * @param {AST._SetClause} node
 * @return {Token[]}
 */
export const _SetClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_SetClause".');

  return t;
};

/**
 * @param {AST._StringLiteral} node
 * @return {Token[]}
 */
export const _StringLiteral = (node) => {
  return [Tokens.String(`'${node.value.replace(/([\\'])/g, '\\$1')}'`)];
};

/**
 * @param {AST._TableCallClause} node
 * @return {Token[]}
 */
export const _TableCallClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.path));
  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.args, Expr));
  t.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    t.push(..._Identifier(node.tableAlias));
  }

  return t;
};

/**
 * @param {AST._TableDef} node
 * @return {Token[]}
 */
export const _TableDef = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.columnDefs, ColumnDef));

  if (node.tableConstraints.length > 0) {
    t.push(Tokens.Punctuator(','));
    t.push(...__CommaDelimitedList(node.tableConstraints, TableConstraint));
  }

  t.push(Tokens.Punctuator(')'));

  if (node.withoutRowId) {
    t.push(..._('WITHOUT ROWID'));
  }

  return t;
};

/**
 * @param {AST._TableQueryClause} node
 * @return {Token[]}
 */
export const _TableQueryClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));

  if (Array.isArray(node.query)) {
    t.push(...__CommaDelimitedList(node.query, TableOrSubquery));
  } else {
    t.push(...JoinClause(node.query));
  }

  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST._TableSelectClause} node
 * @return {Token[]}
 */
export const _TableSelectClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...SelectStmt(node.select));
  t.push(Tokens.Punctuator(')'));

  if (node.tableAlias !== null) {
    t.push(..._Identifier(node.tableAlias));
  }

  return t;
};

/**
 * @param {AST._TableSelectorClause} node
 * @return {Token[]}
 */
export const _TableSelectorClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_TableSelectorClause".');

  return t;
};

/**
 * @param {AST._UniqueClause} node
 * @return {Token[]}
 */
export const _UniqueClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('UNIQUE'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._UniqueConstraint} node
 * @return {Token[]}
 */
export const _UniqueConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('UNIQUE'));
  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(node.indexedColumns, IndexedColumn));
  t.push(Tokens.Punctuator(')'));

  if (node.onConflict !== null) {
    t.push(...ConflictClause(node.onConflict));
  }

  return t;
};

/**
 * @param {AST._UpdateSetClause} node
 * @return {Token[]}
 */
export const _UpdateSetClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "_UpdateSetClause".');

  return t;
};

/**
 * @param {AST._ValueClause} node
 * @return {Token[]}
 */
export const _ValueClause = (node) => {
  return __CommaDelimitedList(node.values, Expr);
};

/**
 * @param {AST._ValuesClause} node
 * @return {Token[]}
 */
export const _ValuesClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('VALUES'));

  for (let i = 0; i < node.rows.length; i++) {
    if (i > 0) {
      t.push(Tokens.Punctuator(','));
    }

    t.push(Tokens.Punctuator('('));
    t.push(..._ValueClause(node.rows[i]));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST._WindowAsClause} node
 * @return {Token[]}
 */
export const _WindowAsClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.windowName));
  t.push(..._('AS'));
  t.push(..._Identifier(node.windowDefn));

  return t;
};

/*
 * External nodes
 * -------------------------------------------------------------------------------------------------
 */

/**
 * @param {AST.AggregateFunctionInvocation} node
 * @return {Token[]}
 */
export const AggregateFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.aggregateFunc));
  t.push(Tokens.Punctuator('('));

  if (node.args !== null) {
    if (node.args === '*') {
      t.push(Tokens.Punctuator('*'));
    } else {
      t.push(..._AggregateArgs(node.args));
    }
  }

  t.push(Tokens.Punctuator(')'));

  if (node.filter !== null) {
    t.push(...FilterClause(node.filter));
  }

  return t;
};

/**
 * @param {AST.AlterTableStmt} node
 * @return {Token[]}
 */
export const AlterTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ALTER TABLE'));
  t.push(...__PathLike(node.path));

  if (node.action.type === '_RenameClause') {
    t.push(..._RenameClause(node.action));
  } else {
    t.push(..._AddClause(node.action));
  }

  return t;
};

/**
 * @param {AST.AnalyzeStmt} node
 * @return {Token[]}
 */
export const AnalyzeStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ANALYZE'));

  if (node.path !== null) {
    t.push(...__PathLike(node.path));
  }

  return t;
};

/**
 * @param {AST.AttachStmt} node
 * @return {Token[]}
 */
export const AttachStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ATTACH'));
  t.push(...Expr(node.expr));
  t.push(..._('AS'));
  t.push(..._Identifier(node.schemaName));

  return t;
};

/**
 * @param {AST.BeginStmt} node
 * @return {Token[]}
 */
export const BeginStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('BEGIN'));

  if (node.mode !== null) {
    t.push(..._(node.mode));
  }

  return t;
};

/**
 * @param {AST.ColumnConstraint} node
 * @return {Token[]}
 */
export const ColumnConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.name !== null) {
    t.push(..._('CONSTRAINT'));
    t.push(..._Identifier(node.name));
  }

  t.push(..._ColumnConstraintClause(node.constraint));

  return t;
};

/**
 * @param {AST.ColumnDef} node
 * @return {Token[]}
 */
export const ColumnDef = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.columnName));

  if (node.typeName !== null) {
    t.push(...TypeName(node.typeName));
  }

  for (const columnConstraint of node.columnConstraints) {
    t.push(...ColumnConstraint(columnConstraint));
  }

  return t;
};

/**
 * @param {AST.ColumnNameList} node
 * @return {Token[]}
 */
export const ColumnNameList = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(Tokens.Punctuator('('));
  t.push(...__CommaDelimitedList(
    node.columnNames,
    (columnName) => [Tokens.Identifier(columnName.name)]
  ));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.CommitStmt} node
 * @return {Token[]}
 */
export const CommitStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('COMMIT'));

  return t;
};

/**
 * @param {AST.CommonTableExpression} node
 * @return {Token[]}
 */
export const CommonTableExpression = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...CteTableName(node.tableName));
  t.push(..._('AS'));
  t.push(Tokens.Punctuator('('));
  t.push(...SelectStmt(node.as));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.ConflictClause} node
 * @return {Token[]}
 */
export const ConflictClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('ON CONFLICT'));
  t.push(..._(node.onConflict));

  return t;
};

/**
 * @param {AST.CreateIndexStmt} node
 * @return {Token[]}
 */
export const CreateIndexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.unique) {
    t.push(..._('UNIQUE'));
  }

  t.push(..._('INDEX'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));
  t.push(..._('ON'));
  t.push(..._Identifier(node.tableName));
  t.push(..._ColumnSelectorClause(node.selector));

  return t;
};

/**
 * @param {AST.CreateTableStmt} node
 * @return {Token[]}
 */
export const CreateTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('TABLE'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));

  if (node.target.type === 'SelectStmt') {
    t.push(..._('AS'));
    t.push(...SelectStmt(node.target));
  } else {
    t.push(..._TableDef(node.target));
  }

  return t;
};

/**
 * @param {AST.CreateTriggerStmt} node
 * @return {Token[]}
 */
export const CreateTriggerStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('TRIGGER'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  t.push(...__PathLike(node.path));

  if (node.position !== null) {
    t.push(..._(node.position));
  }

  if (Array.isArray(node.event)) {
    t.push(..._('UPDATE OF'));
    t.push(...__CommaDelimitedList(node.event, _Identifier));
  } else {
    t.push(..._(node.event));
  }

  t.push(..._('ON'));
  t.push(..._Identifier(node.tableName));

  if (node.forEachRow) {
    t.push(..._('FOR EACH ROW'));
  }

  if (node.when) {
    t.push(..._('WHEN'));
    t.push(...Expr(node.when));
  }

  t.push(..._('BEGIN'));

  for (const stmt of node.begin) {
    switch (stmt.type) {
      case 'UpdateStmt':
        t.push(...UpdateStmt(stmt));
        break;
      case 'InsertStmt':
        t.push(...InsertStmt(stmt));
        break;
      case 'DeleteStmt':
        t.push(...DeleteStmt(stmt));
        break;
      case 'SelectStmt':
        t.push(...SelectStmt(stmt));
        break;
      default:
        throw new TypeError(`Unexpected node type: ${/** @type {any} */ (stmt).type}`);
    }

    t.push(Tokens.Punctuator(';'));
  }

  t.push(..._('END'));

  return t;
};

/**
 * @param {AST.CreateViewStmt} node
 * @return {Token[]}
 */
export const CreateViewStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "CreateViewStmt".');
  t.push(..._('CREATE'));

  if (node.temporary) {
    t.push(..._('TEMP'));
  }

  t.push(..._('VIEW'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  return t;
};

/**
 * @param {AST.CreateVirtualTableStmt} node
 * @return {Token[]}
 */
export const CreateVirtualTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "CreateVirtualTableStmt".');
  t.push(..._('CREATE VIRTUAL TABLE'));

  if (node.ifNotExists) {
    t.push(..._('IF NOT EXISTS'));
  }

  return t;
};

/**
 * @param {AST.CteTableName} node
 * @return {Token[]}
 */
export const CteTableName = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._Identifier(node.tableName));

  if (node.columnNames.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__CommaDelimitedList(node.columnNames, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST.DeleteStmt} node
 * @return {Token[]}
 */
export const DeleteStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DeleteStmt".');
  t.push(..._('DELETE'));

  return t;
};

/**
 * @param {AST.DetachStmt} node
 * @return {Token[]}
 */
export const DetachStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DetachStmt".');
  t.push(..._('DETACH'));

  return t;
};

/**
 * @param {AST.DropIndexStmt} node
 * @return {Token[]}
 */
export const DropIndexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DropIndexStmt".');
  t.push(..._('DROP'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(..._('INDEX'));
  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropTableStmt} node
 * @return {Token[]}
 */
export const DropTableStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DropTableStmt".');
  t.push(..._('DROP'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(..._('TABLE'));
  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropTriggerStmt} node
 * @return {Token[]}
 */
export const DropTriggerStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DropTriggerStmt".');
  t.push(..._('DROP'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(..._('TRIGGER'));
  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.DropViewStmt} node
 * @return {Token[]}
 */
export const DropViewStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "DropViewStmt".');
  t.push(..._('DROP'));

  if (node.ifExists) {
    t.push(..._('IF EXISTS'));
  }

  t.push(..._('VIEW'));
  t.push(...__PathLike(node.path));

  return t;
};

/**
 * @param {AST.Expr} node
 * @return {Token[]}
 */
export const Expr = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
    case '_StringLiteral':
    case '_BlobLiteral':
      return LiteralValue(node);
    case '_BindParameter':
      return _BindParameter(node);
    case '_ColumnPath':
      return _ColumnPath(node);
    case '_Path':
      return _Path(node);
    case '_Identifier':
      return _Identifier(node);
    case '_BinaryExpression':
      return _BinaryExpression(node);
    case '_CallExpression':
      return _CallExpression(node);
    case '_SequenceExpression':
      return _SequenceExpression(node);
    case '_CastExpression':
      return _CastExpression(node);
    case '_CollateExpression':
      return _CollateExpression(node);
    case '_BinaryKeywordExpression':
      return _BinaryKeywordExpression(node);
    case '_NullComparisonExpression':
      return _NullComparisonExpression(node);
    case '_IsExpression':
      return _IsExpression(node);
    case '_BetweenExpression':
      return _BetweenExpression(node);
    case '_InExpression':
      return _InExpression(node);
    case '_ExistsExpression':
      return _ExistsExpression(node);
    case '_CaseExpression':
      return _CaseExpression(node);
    case 'RaiseFunction':
      return RaiseFunction(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.FactoredSelectStmt} node
 * @return {Token[]}
 */
export const FactoredSelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "FactoredSelectStmt".');

  return t;
};

/**
 * @param {AST.FilterClause} node
 * @return {Token[]}
 */
export const FilterClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('FILTER'));
  t.push(Tokens.Punctuator('('));
  t.push(..._('WHERE'));
  t.push(...Expr(node.where));
  t.push(Tokens.Punctuator(')'));

  return t;
};

/**
 * @param {AST.ForeignKeyClause} node
 * @return {Token[]}
 */
export const ForeignKeyClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('REFERENCES'));
  t.push(..._Identifier(node.foreignTable));

  if (node.columnNames.length > 0) {
    t.push(Tokens.Punctuator('('));
    t.push(...__CommaDelimitedList(node.columnNames, _Identifier));
    t.push(Tokens.Punctuator(')'));
  }

  for (const event of node.events) {
    if (event.type === '_OnClause') {
      t.push(..._OnClause(event));
    } else {
      t.push(..._MatchClause(event));
    }
  }

  if (node.deferrable) {
    t.push(..._DeferrableClause(node.deferrable));
  }

  return t;
};

/**
 * @param {AST.FrameSpec} node
 * @return {Token[]}
 */
export const FrameSpec = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._(node.frame));

  if (typeof node.target === 'string') {
    t.push(..._(node.target));
  } else if (node.target.type === '_FrameSpecBetweenClause') {
    t.push(..._FrameSpecBetweenClause(node.target));
  } else {
    t.push(...Expr(node.target));
    t.push(..._('PRECEDING'));
  }

  if (node.exclude !== null) {
    t.push(..._(node.exclude));
  }

  return t;
};

/**
 * @param {AST.IndexedColumn} node
 * @return {Token[]}
 */
export const IndexedColumn = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...Expr(node.target));

  if (node.collationName !== null) {
    t.push(..._('COLLATE'));
    t.push(..._Identifier(node.collationName));
  }

  if (node.orderBy !== null) {
    t.push(..._(node.orderBy));
  }

  return t;
};

/**
 * @param {AST.InsertStmt} node
 * @return {Token[]}
 */
export const InsertStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "InsertStmt".');
  t.push(..._('INSERT INTO'));

  return t;
};

/**
 * @param {AST.JoinClause} node
 * @return {Token[]}
 */
export const JoinClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "JoinClause".');

  return t;
};

/**
 * @param {AST.JoinConstraint} node
 * @return {Token[]}
 */
export const JoinConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "JoinConstraint".');

  return t;
};

/**
 * @param {AST.LiteralValue} node
 * @return {Token[]}
 */
export const LiteralValue = (node) => {
  switch (node.type) {
    case '_NumericLiteral':
      return _NumericLiteral(node);
    case '_StringLiteral':
      return _StringLiteral(node);
    case '_BlobLiteral':
      return _BlobLiteral(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.OrderingTerm} node
 * @return {Token[]}
 */
export const OrderingTerm = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...IndexedColumn(node.indexedColumn));

  if (node.nulls !== null) {
    t.push(..._('NULLS'));
    t.push(..._(node.nulls));
  }

  return t;
};

/**
 * @param {AST.OverClause} node
 * @return {Token[]}
 */
export const OverClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "OverClause".');

  return t;
};

/**
 * @param {AST.PragmaStmt} node
 * @return {Token[]}
 */
export const PragmaStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "PragmaStmt".');
  t.push(..._('PRAGMA'));

  return t;
};

/**
 * @param {AST.PragmaValue} node
 * @return {Token[]}
 */
export const PragmaValue = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "PragmaValue".');

  return t;
};

/**
 * @param {AST.QualifiedTableName} node
 * @return {Token[]}
 */
export const QualifiedTableName = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(...__PathLike(node.path));

  if (node.alias !== null) {
    t.push(..._('AS'));
    t.push(..._Identifier(node.alias));
  }

  if (node.indexedBy === false) {
    t.push(..._('NOT INDEXED'));
  } else if (node.indexedBy !== null) {
    t.push(..._('INDEXED BY'));
    t.push(..._Identifier(node.indexedBy));
  }

  return t;
};

/**
 * @param {AST.RaiseFunction} node
 * @return {Token[]}
 */
export const RaiseFunction = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "RaiseFunction".');

  return t;
};

/**
 * @param {AST.RecursiveCte} node
 * @return {Token[]}
 */
export const RecursiveCte = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "RecursiveCte".');

  return t;
};

/**
 * @param {AST.ReindexStmt} node
 * @return {Token[]}
 */
export const ReindexStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "ReindexStmt".');
  t.push(..._('REINDEX'));

  return t;
};

/**
 * @param {AST.ReleaseStmt} node
 * @return {Token[]}
 */
export const ReleaseStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "ReleaseStmt".');
  t.push(..._('RELEASE'));

  return t;
};

/**
 * @param {AST.ResultColumn} node
 * @return {Token[]}
 */
export const ResultColumn = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.source === '*') {
    t.push(Tokens.Punctuator('*'));
  } else if (node.source.type === '_ColumnAliasClause') {
    t.push(..._ColumnAliasClause(node.source));
  } else if (node.source.type === '_AllColumnsClause') {
    t.push(..._AllColumnsClause(node.source));
  } else {
    t.push(...Expr(node.source));
  }

  return t;
};

/**
 * @param {AST.RollbackStmt} node
 * @return {Token[]}
 */
export const RollbackStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "RollbackStmt".');
  t.push(..._('ROLLBACK'));

  return t;
};

/**
 * @param {AST.SavepointStmt} node
 * @return {Token[]}
 */
export const SavepointStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "SavepointStmt".');
  t.push(..._('SAVEPOINT'));

  return t;
};

/**
 * @param {AST.SelectCore} node
 * @return {Token[]}
 */
export const SelectCore = (node) => {
  return node.type === '_SelectClause'
    ? _SelectClause(node)
    : _ValuesClause(node);
};

/**
 * @param {AST.SelectStmt} node
 * @return {Token[]}
 */
export const SelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.withClause !== null) {
    t.push(...WithClause(node.withClause));
  }

  t.push(...SelectCore(node.select[0]));

  for (let i = 1; i < node.select.length; i++) {
    t.push(..._SelectCompound(/** @type {AST._SelectCompound} */ (node.select[i])));
  }

  if (node.limiter !== null) {
    t.push(..._LimiterClause(node.limiter));
  }

  return t;
};

/**
 * @param {AST.SimpleFunctionInvocation} node
 * @return {Token[]}
 */
export const SimpleFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "SimpleFunctionInvocation".');

  return t;
};

/**
 * @param {AST.SimpleSelectStmt} node
 * @return {Token[]}
 */
export const SimpleSelectStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "SimpleSelectStmt".');
  t.push(..._('SELECT'));

  return t;
};

/**
 * @param {AST.SqlStmt} node
 * @return {Token[]}
 */
export const SqlStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "SqlStmt".');

  return t;
};

/**
 * @param {AST.SqlStmtList} node
 * @return {Token[]}
 */
export const SqlStmtList = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "SqlStmtList".');

  return t;
};

/**
 * @param {AST.TableConstraint} node
 * @return {Token[]}
 */
export const TableConstraint = (node) => {
  /** @type {Token[]} */
  const t = [];

  if (node.name !== null) {
    t.push(..._('CONSTRAINT'));
    t.push(..._Identifier(node.name));
  }

  switch (node.constraint.type) {
    case '_PrimaryKeyConstraint':
      t.push(..._PrimaryKeyConstraint(node.constraint));
      break;
    case '_UniqueConstraint':
      t.push(..._UniqueConstraint(node.constraint));
      break;
    case '_CheckConstraint':
      t.push(..._CheckConstraint(node.constraint));
      break;
    case '_ForeignKeyConstraint':
      t.push(..._ForeignKeyConstraint(node.constraint));
      break;
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }

  return t;
};

/**
 * @param {AST.TableOrSubquery} node
 * @return {Token[]}
 */
export const TableOrSubquery = (node) => {
  switch (node.type) {
    case 'QualifiedTableName':
      return QualifiedTableName(node);
    case '_TableCallClause':
      return _TableCallClause(node);
    case '_TableSelectClause':
      return _TableSelectClause(node);
    case '_TableQueryClause':
      return _TableQueryClause(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};

/**
 * @param {AST.TypeName} node
 * @return {Token[]}
 */
export const TypeName = (node) => {
  /** @type {Token[]} */
  const t = [];

  for (const name of node.names) {
    t.push(..._(name));
  }

  if (node.args[0] !== undefined) {
    t.push(Tokens.Punctuator('('));
    t.push(..._NumericLiteral(node.args[0]));

    if (node.args[1] !== undefined) {
      t.push(Tokens.Punctuator(','));
      t.push(..._NumericLiteral(node.args[1]));
    }

    t.push(Tokens.Punctuator(')'));
  }

  return t;
};

/**
 * @param {AST.UpdateStmt} node
 * @return {Token[]}
 */
export const UpdateStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "UpdateStmt".');
  t.push(..._('UPDATE'));

  return t;
};

/**
 * @param {AST.UpsertClause} node
 * @return {Token[]}
 */
export const UpsertClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "UpsertClause".');

  return t;
};

/**
 * @param {AST.VacuumStmt} node
 * @return {Token[]}
 */
export const VacuumStmt = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "VacuumStmt".');
  t.push(..._('VACUUM'));

  return t;
};

/**
 * @param {AST.WindowDefn} node
 * @return {Token[]}
 */
export const WindowDefn = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "WindowDefn".');

  return t;
};

/**
 * @param {AST.WindowFunctionInvocation} node
 * @return {Token[]}
 */
export const WindowFunctionInvocation = (node) => {
  /** @type {Token[]} */
  const t = [];

  throw new Error('Compiler not implemented for node type "WindowFunctionInvocation".');

  return t;
};

/**
 * @param {AST.WithClause} node
 * @return {Token[]}
 */
export const WithClause = (node) => {
  /** @type {Token[]} */
  const t = [];

  t.push(..._('WITH'));

  if (node.recursive) {
    t.push(..._('RECURSIVE'));
  }

  t.push(...__CommaDelimitedList(node.expressions, CommonTableExpression));

  return t;
};

/**
 * @param {AST._Node} node
 * @return {Token[]}
 */
export const tokenize = (node) => {
  switch (node.type) {
    case '_AddClause':
      return _AddClause(node);
    case '_AggregateArgs':
      return _AggregateArgs(node);
    case '_AsClause':
      return _AsClause(node);
    case '_BetweenExpression':
      return _BetweenExpression(node);
    case '_BinaryExpression':
      return _BinaryExpression(node);
    case '_BinaryKeywordExpression':
      return _BinaryKeywordExpression(node);
    case '_BindParameter':
      return _BindParameter(node);
    case '_BlobLiteral':
      return _BlobLiteral(node);
    case '_CallExpression':
      return _CallExpression(node);
    case '_CaseExpression':
      return _CaseExpression(node);
    case '_CaseClause':
      return _CaseClause(node);
    case '_CastExpression':
      return _CastExpression(node);
    case '_CheckClause':
      return _CheckClause(node);
    case '_CheckConstraint':
      return _CheckConstraint(node);
    case '_CollateClause':
      return _CollateClause(node);
    case '_CollateExpression':
      return _CollateExpression(node);
    case '_ColumnAliasClause':
      return _ColumnAliasClause(node);
    case '_ColumnPath':
      return _ColumnPath(node);
    case '_ColumnSelectorClause':
      return _ColumnSelectorClause(node);
    case '_DefaultClause':
      return _DefaultClause(node);
    case '_DeferrableClause':
      return _DeferrableClause(node);
    case '_ExistsExpression':
      return _ExistsExpression(node);
    case '_ForeignKeyConstraint':
      return _ForeignKeyConstraint(node);
    case '_FrameSpecBetweenClause':
      return _FrameSpecBetweenClause(node);
    case '_FrameSpecExprClause':
      return _FrameSpecExprClause(node);
    case '_GroupByClause':
      return _GroupByClause(node);
    case '_Identifier':
      return _Identifier(node);
    case '_InExpression':
      return _InExpression(node);
    case '_InsertSelectClause':
      return _InsertSelectClause(node);
    case '_InsertValuesClause':
      return _InsertValuesClause(node);
    case '_IsExpression':
      return _IsExpression(node);
    case '_JoinCompound':
      return _JoinCompound(node);
    case '_JoinOnClause':
      return _JoinOnClause(node);
    case '_JoinUsingClause':
      return _JoinUsingClause(node);
    case '_LimitClause':
      return _LimitClause(node);
    case '_LimiterClause':
      return _LimiterClause(node);
    case '_LimitTailClause':
      return _LimitTailClause(node);
    case '_MatchClause':
      return _MatchClause(node);
    case '_NotNullClause':
      return _NotNullClause(node);
    case '_NullComparisonExpression':
      return _NullComparisonExpression(node);
    case '_NumericLiteral':
      return _NumericLiteral(node);
    case '_OnClause':
      return _OnClause(node);
    case '_Path':
      return _Path(node);
    case '_PragmaGetter':
      return _PragmaGetter(node);
    case '_PragmaSetter':
      return _PragmaSetter(node);
    case '_PrimaryKeyClause':
      return _PrimaryKeyClause(node);
    case '_PrimaryKeyConstraint':
      return _PrimaryKeyConstraint(node);
    case '_RenameClause':
      return _RenameClause(node);
    case '_SelectClause':
      return _SelectClause(node);
    case '_SelectCompound':
      return _SelectCompound(node);
    case '_SelectorClause':
      return _SelectorClause(node);
    case '_SequenceExpression':
      return _SequenceExpression(node);
    case '_SetClause':
      return _SetClause(node);
    case '_StringLiteral':
      return _StringLiteral(node);
    case '_TableCallClause':
      return _TableCallClause(node);
    case '_TableDef':
      return _TableDef(node);
    case '_TableQueryClause':
      return _TableQueryClause(node);
    case '_TableSelectClause':
      return _TableSelectClause(node);
    case '_TableSelectorClause':
      return _TableSelectorClause(node);
    case '_UniqueClause':
      return _UniqueClause(node);
    case '_UniqueConstraint':
      return _UniqueConstraint(node);
    case '_UpdateSetClause':
      return _UpdateSetClause(node);
    case '_ValueClause':
      return _ValueClause(node);
    case '_ValuesClause':
      return _ValuesClause(node);
    case '_WindowAsClause':
      return _WindowAsClause(node);
    case 'AggregateFunctionInvocation':
      return AggregateFunctionInvocation(node);
    case 'AlterTableStmt':
      return AlterTableStmt(node);
    case 'AnalyzeStmt':
      return AnalyzeStmt(node);
    case 'AttachStmt':
      return AttachStmt(node);
    case 'BeginStmt':
      return BeginStmt(node);
    case 'ColumnConstraint':
      return ColumnConstraint(node);
    case 'ColumnDef':
      return ColumnDef(node);
    case 'ColumnNameList':
      return ColumnNameList(node);
    case 'CommitStmt':
      return CommitStmt(node);
    case 'CommonTableExpression':
      return CommonTableExpression(node);
    case 'ConflictClause':
      return ConflictClause(node);
    case 'CreateIndexStmt':
      return CreateIndexStmt(node);
    case 'CreateTableStmt':
      return CreateTableStmt(node);
    case 'CreateTriggerStmt':
      return CreateTriggerStmt(node);
    case 'CreateViewStmt':
      return CreateViewStmt(node);
    case 'CreateVirtualTableStmt':
      return CreateVirtualTableStmt(node);
    case 'CteTableName':
      return CteTableName(node);
    case 'DeleteStmt':
      return DeleteStmt(node);
    case 'DetachStmt':
      return DetachStmt(node);
    case 'DropIndexStmt':
      return DropIndexStmt(node);
    case 'DropTableStmt':
      return DropTableStmt(node);
    case 'DropTriggerStmt':
      return DropTriggerStmt(node);
    case 'DropViewStmt':
      return DropViewStmt(node);
    case 'FactoredSelectStmt':
      return FactoredSelectStmt(node);
    case 'FilterClause':
      return FilterClause(node);
    case 'ForeignKeyClause':
      return ForeignKeyClause(node);
    case 'FrameSpec':
      return FrameSpec(node);
    case 'IndexedColumn':
      return IndexedColumn(node);
    case 'InsertStmt':
      return InsertStmt(node);
    case 'JoinClause':
      return JoinClause(node);
    case 'JoinConstraint':
      return JoinConstraint(node);
    case 'OrderingTerm':
      return OrderingTerm(node);
    case 'OverClause':
      return OverClause(node);
    case 'PragmaStmt':
      return PragmaStmt(node);
    case 'PragmaValue':
      return PragmaValue(node);
    case 'QualifiedTableName':
      return QualifiedTableName(node);
    case 'RaiseFunction':
      return RaiseFunction(node);
    case 'RecursiveCte':
      return RecursiveCte(node);
    case 'ReindexStmt':
      return ReindexStmt(node);
    case 'ReleaseStmt':
      return ReleaseStmt(node);
    case 'ResultColumn':
      return ResultColumn(node);
    case 'RollbackStmt':
      return RollbackStmt(node);
    case 'SavepointStmt':
      return SavepointStmt(node);
    case 'SelectStmt':
      return SelectStmt(node);
    case 'SimpleFunctionInvocation':
      return SimpleFunctionInvocation(node);
    case 'SimpleSelectStmt':
      return SimpleSelectStmt(node);
    case 'SqlStmt':
      return SqlStmt(node);
    case 'SqlStmtList':
      return SqlStmtList(node);
    case 'TableConstraint':
      return TableConstraint(node);
    case 'TypeName':
      return TypeName(node);
    case 'UpdateStmt':
      return UpdateStmt(node);
    case 'UpsertClause':
      return UpsertClause(node);
    case 'VacuumStmt':
      return VacuumStmt(node);
    case 'WindowDefn':
      return WindowDefn(node);
    case 'WindowFunctionInvocation':
      return WindowFunctionInvocation(node);
    case 'WithClause':
      return WithClause(node);
    default:
      throw new TypeError(`Unexpected node type: ${/** @type {any} */ (node).type}`);
  }
};
