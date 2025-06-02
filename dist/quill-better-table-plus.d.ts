declare module 'quill-better-table-plus' {
  import Quill from 'quill';

  interface TableOptions {
    operationMenu?: {
      items?: {
        insertColumnRight?: {
          text?: string;
        };
        insertColumnLeft?: {
          text?: string;
        };
        insertRowUp?: {
          text?: string;
        };
        insertRowDown?: {
          text?: string;
        };
        mergeCells?: {
          text?: string;
        };
        unmergeCells?: {
          text?: string;
        };
        deleteColumn?: {
          text?: string;
        };
        deleteRow?: {
          text?: string;
        };
        deleteTable?: {
          text?: string;
        };
      };
      background?: {
        color?: string;
      };
      color?: {
        colors?: string[];
        text?: string;
      };
    };
    selection?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  }

  interface QuillBetterTablePlus {
    new (quill: Quill, options?: TableOptions): QuillBetterTablePlus;
    insertTable(rows: number, columns: number): void;
    getTable(): any;
    deleteTable(): void;
    insertRowAbove(): void;
    insertRowBelow(): void;
    insertColumnLeft(): void;
    insertColumnRight(): void;
    deleteRow(): void;
    deleteColumn(): void;
    mergeCells(): void;
    unmergeCells(): void;
  }

  const QuillBetterTablePlus: {
    new (quill: Quill, options?: TableOptions): QuillBetterTablePlus;
    keyboardBindings?: any;
  };

  export default QuillBetterTablePlus;
}

declare module 'quill' {
  interface QuillOptionsStatic {
    'better-table'?: import('quill-better-table-plus').TableOptions;
  }
}
