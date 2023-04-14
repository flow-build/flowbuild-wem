export type TopicCreationInput = {
  name: string
  event: {
    definition: string
    family: string
    category: string
  }
}
