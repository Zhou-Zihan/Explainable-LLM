import { observable, action, makeObservable } from 'mobx'

class Store1 {
  constructor() {
    makeObservable(this) //mobx6.0之后必须要加上这一句
  }

  @observable
  curDataset: any = null

  @action
  setCurDataset = (dataset: any) => {
    this.curDataset = dataset
  }

  @observable
  curQuestionID: number = null

  @action
  setCurQuestionID = (id: number) => {
    this.curQuestionID = id
  }

  @observable
  curQuestionSegment: QuestionData = null

  @action
  setCurQuestionSegment = (data: QuestionData) => {
    this.curQuestionSegment = data
  }
}

const store = new Store1()
export default store
