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

declare interface RefInfo_Symptom {
  id: number
  type: string
  content: string
  definitions: string
  relationship: { [key: string]: string[] }
}

declare interface RefInfo_Diagnosis {
  id: number
  type: string
  content: string
  definitions: string
  relationship: { [key: string]: string[] }
}

declare interface DrugInteraction {
  drug_inter: string
  drug_name: string
  detail_info: string
}

declare interface RefInfo_Treatment {
  id: number
  type: string
  content: string
  definitions: string
  indications: string
  related_product: string
  adverse_effects: string
  food_interactions: string
  drug_interactions: DrugInteraction[]
  contradictions: string
  // relationship: { [key: string]: string[] }
}

declare interface RefInfo_Complication {
  id: number
  type: string
  content: string
  definitions: string
  // relationship: { [key: string]: string[] }
}
