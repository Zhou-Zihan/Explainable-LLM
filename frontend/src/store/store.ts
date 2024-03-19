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
  curQuestionData: QuestionData = null

  @action
  setCurQuestionData = (data: QuestionData) => {
    this.curQuestionData = data
  }

  @observable
  homeState: HomeState = {
    chatId: null,
    // selectedChat: null,
    chatList: [],
    frontendMessages: [],
    messageIsStreaming: false
  }

  @observable
  messageIsStreaming = false

  @action
  setMessageIsStreaming = (value: boolean) => {
    this.messageIsStreaming = value
  }

  @observable
  frontendMessages: Message[] = []

  @action
  setFrontendMessages = (messages: Message[]) => {
    this.frontendMessages = messages
  }
}

const store = new Store1()
export default store
