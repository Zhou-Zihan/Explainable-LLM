declare interface SegmentData {
  classification: string
  description: string
}

declare interface QuestionData {
  id: number
  question: string
  options: string[]
  segment: SegmentData[]
}

declare interface Chat {
  chatId: string
  title: string
  model: string
  temperature: number
  createTime: string
  backendMessages: []
}

declare interface Message {
  id: number
  parentId: number
  content: string
  role: string
}

declare interface HomeState {
  chatId: string | null
  chatList: Chat[]
  frontendMessages: Message[]
  messageIsStreaming: boolean
}

declare interface Node {
  id: number
  type: string
  content: string
}
