declare interface SegmentData {
  classification: string
  description: string
}

declare interface QuestionData {
  id: number
  question: string
  options: string[]
  segments: SegmentData[]
}
