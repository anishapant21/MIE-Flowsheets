export enum IQuestionnaireItemType {
    choice = 'choice',
    date = 'date',
    string = 'string',
    url = 'url',
  }
  
 export interface Node {
    title: string;
    hierarchy?: string;
    nodeType?: IQuestionnaireItemType;
    nodeReadableType?: string;
    children: Node[];
  }