declare module 'pug-parser' {
	namespace parse {
		export interface BlockNode {
			type: 'Block';
			nodes: TagNode[];
			line: number;
			tokens?: any[];
		}

		export interface TagNode {
			type: 'Tag';
			name: string;
			selfClosing: boolean;
			block: BlockNode;
			attrs: any[];
			attributeBlocks: any[];
			isInline: boolean;
			line: number;
			column: number;
		}

		export interface TextNode {
			type: 'Text';
			val: string;
			line: number;
			column: number;
		}
	}
	function parse(tokens: any, options: any): any;
	export = parse;
}
