/* eslint-disable @typescript-eslint/no-use-before-define */
import { Doc, doc, FastPath, ParserOptions } from 'prettier';
import { BlockNode, TagNode, TextNode } from 'pug-parser';
import { createLogger, Logger, LogLevel } from '../logger';
import { PugParserOptions } from '../options';

const logger: Logger = createLogger(console);
if (process.env.NODE_ENV === 'test') {
	logger.setLogLevel(LogLevel.DEBUG);
}

const { builders } = doc;
const { concat, join } = builders;

const REG = {
	Block: printBlock,
	Tag: printTag,
	Text: printText,
	concat: printConcat
};

function printBlock(
	node: BlockNode,
	path: FastPath,
	options: ParserOptions & PugParserOptions,
	print: (path: FastPath) => Doc
): Doc {
	logger.log('printBlock:', node);
	if (node === undefined) {
		return '';
	}
	return concat(path.map(print));
}

function printTag(
	node: TagNode,
	path: FastPath,
	options: ParserOptions & PugParserOptions,
	print: (path: FastPath) => Doc
): doc.builders.Concat {
	logger.log('printTag:', node);
	return concat([node.name, path.call(print, 'Block')]);
}

function printText(
	node: TextNode,
	path: FastPath,
	options: ParserOptions & PugParserOptions,
	print: (path: FastPath) => Doc
): string {
	logger.log('printText:', node);
	return node.val;
}

function printConcat(
	node: doc.builders.Concat,
	path: FastPath,
	options: ParserOptions & PugParserOptions,
	print: (path: FastPath) => Doc
): doc.builders.Concat {
	logger.log('printConcat:', node);
	return join('', node.parts);
}

export function print(path: FastPath, options: ParserOptions & PugParserOptions, print: (path: FastPath) => Doc): Doc {
	const node: any | undefined = path.getNode();
	const name: string | null = path.getName() as string | null;
	let nodeType: keyof typeof REG;
	if (name === null) {
		// Is it the root node?
		if (node === undefined) {
			console.log('node was undefined');

			return '';
		}
		nodeType = node.type;
	} else {
		nodeType = name as keyof typeof REG;
	}
	logger.debug('print:', {
		name: name,
		node: node,
		parentNode: path.getParentNode(),
		value: path.getValue()
	});
	// const doc = REG[nodeType]?.(node as any, path, options, print);
	// if (doc !== undefined) {
	// 	logger.debug('print doc:', doc);
	// 	return doc;
	// }
	switch (nodeType) {
		case 'Block':
			logger.log('print switch Block:', node);
			return concat(
				path.map((path, index) => {
					return path.call(print, node.nodes[index].type);
				})
			);
		case 'Tag':
			logger.log('print switch Tag:', node);
			return concat([node.name, path.call(print, 'Block')]);
		case 'Text':
			logger.log('print switch Text:', node);
			return node.val;
		case 'concat':
			logger.log('print switch Concat:', node);
			return join('', node.parts);
		default:
			console.warn('print switch default', node);
	}
	throw new Error('Unhandled type:\n' + JSON.stringify(node, null, 2));
}
